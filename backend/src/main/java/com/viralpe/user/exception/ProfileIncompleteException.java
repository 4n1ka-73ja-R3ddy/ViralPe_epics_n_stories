package com.viralpe.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ProfileIncompleteException extends RuntimeException {
    public ProfileIncompleteException() {
        super("Profile incomplete. Pincode entry required.");
    }

    public ProfileIncompleteException(String message) {
        super(message);
    }
}
