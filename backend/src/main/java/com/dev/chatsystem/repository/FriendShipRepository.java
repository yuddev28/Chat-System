package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.FriendShip;
import com.dev.chatsystem.model.FriendShipStatus;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendShipRepository extends JpaRepository<FriendShip, Long> {

    @Query("SELECT f FROM FriendShip f WHERE (f.userA = :u1 AND f.userB = :u2) OR (f.userA = :u2 AND f.userB = :u1)")
    Optional<FriendShip> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    @Query("SELECT f FROM FriendShip f WHERE (f.userA = :user OR f.userB = :user) AND f.status = :status")
    List<FriendShip> findAllByUserAndStatus(@Param("user") User user, @Param("status") FriendShipStatus status);
}
