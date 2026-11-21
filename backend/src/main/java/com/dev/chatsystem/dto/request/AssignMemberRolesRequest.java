package com.dev.chatsystem.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AssignMemberRolesRequest {
    private List<Long> roleIds;
}
