package com.dev.chatsystem.service.impl;

import com.dev.chatsystem.dto.request.SendFriendRequest;
import com.dev.chatsystem.dto.response.FriendRequestResponse;
import com.dev.chatsystem.dto.response.FriendshipResponse;
import com.dev.chatsystem.dto.response.UserResponse;
import com.dev.chatsystem.exception.AppException;
import com.dev.chatsystem.exception.ErrorCode;
import com.dev.chatsystem.model.*;
import com.dev.chatsystem.repository.FriendRequestRepository;
import com.dev.chatsystem.repository.FriendShipRepository;
import com.dev.chatsystem.repository.UserRepository;
import com.dev.chatsystem.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of FriendshipService handling friend requests, acceptance, blocking, and friend lists.
 */
@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendShipRepository friendShipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    /**
     * Sends a friend request to a designated recipient.
     * Business logic:
     * 1. Resolves the target user either by targetUserId, or cleans and looks up by userTag (e.g. "username#1234"),
     *    or falls back to username/email search.
     * 2. Prevents users from adding themselves as a friend.
     * 3. Checks if an active friendship with status FRIEND already exists between the two users.
     * 4. Creates and saves a new FriendRequest in PENDING state.
     */
    @Override
    @Transactional
    public FriendRequestResponse sendFriendRequest(User currentUser, SendFriendRequest request) {
        User targetUser = null;
        if (request.getTargetUserId() != null) {
            targetUser = userRepository.findById(request.getTargetUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else if (request.getUserTag() != null && !request.getUserTag().isBlank()) {
            String clean = request.getUserTag().trim();
            targetUser = userRepository.findByUsername(clean)
                    .or(() -> userRepository.findByEmail(clean.contains("#") ? clean.substring(0, clean.indexOf("#")) : clean))
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với tag " + request.getUserTag()));
        } else if (request.getUsername() != null && !request.getUsername().isBlank()) {
            targetUser = userRepository.findByUsername(request.getUsername().trim())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else {
            throw new AppException(ErrorCode.USER_NOT_FOUND, "Thiếu thông tin người dùng nhận lời mời");
        }

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new AppException(ErrorCode.CANNOT_ADD_SELF);
        }

        Optional<FriendShip> existingFriendship = friendShipRepository.findBetweenUsers(currentUser, targetUser);
        if (existingFriendship.isPresent() && existingFriendship.get().getStatus() == FriendShipStatus.FRIEND) {
            throw new AppException(ErrorCode.ALREADY_FRIENDS);
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(currentUser)
                .receiver(targetUser)
                .status(FriendRequestStatus.PENDING)
                .build();

        FriendRequest saved = friendRequestRepository.save(friendRequest);
        return FriendRequestResponse.fromEntity(saved);
    }

    /**
     * Responds to an incoming friend request (accept or reject).
     * Business logic:
     * 1. Verifies that the friend request exists and that currentUser is the intended receiver.
     * 2. If accepted: updates request status to ACCEPTED, then either creates or updates a FriendShip record
     *    with status FRIEND between sender and receiver.
     * 3. If rejected: updates request status to REJECTED without creating a friendship record.
     */
    @Override
    @Transactional
    public FriendshipResponse respondFriendRequest(User currentUser, Long requestId, boolean accept) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        if (!req.getReceiver().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không thể xử lý lời mời kết bạn của người khác");
        }

        if (accept) {
            req.setStatus(FriendRequestStatus.ACCEPTED);
            friendRequestRepository.save(req);

            FriendShip friendShip = friendShipRepository.findBetweenUsers(req.getSender(), req.getReceiver())
                    .orElse(FriendShip.builder()
                            .userA(req.getSender())
                            .userB(req.getReceiver())
                            .status(FriendShipStatus.FRIEND)
                            .build());
            friendShip.setStatus(FriendShipStatus.FRIEND);
            FriendShip savedFriendShip = friendShipRepository.save(friendShip);
            return FriendshipResponse.fromEntity(savedFriendShip);
        } else {
            req.setStatus(FriendRequestStatus.REJECTED);
            friendRequestRepository.save(req);
            return null;
        }
    }

    /**
     * Removes an active friendship record between two users.
     */
    @Override
    @Transactional
    public void unfriend(User currentUser, Long targetUserId) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FriendShip friendship = friendShipRepository.findBetweenUsers(currentUser, targetUser)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND, "Không tồn tại mối quan hệ bạn bè"));

        friendShipRepository.delete(friendship);
    }

    /**
     * Blocks a target user, creating or updating a FriendShip entity with status BLOCKED.
     */
    @Override
    @Transactional
    public void blockUser(User currentUser, Long targetUserId) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FriendShip friendship = friendShipRepository.findBetweenUsers(currentUser, targetUser)
                .orElse(FriendShip.builder()
                        .userA(currentUser)
                        .userB(targetUser)
                        .status(FriendShipStatus.BLOCKED)
                        .build());

        friendship.setStatus(FriendShipStatus.BLOCKED);
        friendShipRepository.save(friendship);
    }

    /**
     * Lists all confirmed friends for the current user.
     */
    @Override
    public List<UserResponse> getFriendsList(User currentUser) {
        List<FriendShip> friendships = friendShipRepository.findAllByUserAndStatus(currentUser, FriendShipStatus.FRIEND);
        return friendships.stream().map(f -> {
            User friend = f.getUserA().getId().equals(currentUser.getId()) ? f.getUserB() : f.getUserA();
            return UserResponse.fromEntity(friend);
        }).toList();
    }

    /**
     * Returns all pending friend requests directed to the current user.
     */
    @Override
    public List<FriendRequestResponse> getPendingRequests(User currentUser) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(currentUser, FriendRequestStatus.PENDING);
        return requests.stream().map(FriendRequestResponse::fromEntity).toList();
    }
}
