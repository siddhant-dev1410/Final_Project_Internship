package com.example.contactbook.dto;

public class AuthDtos {

    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public String username;

        public AuthResponse(String token, String username) {
            this.token = token;
            this.username = username;
        }
    }
}
