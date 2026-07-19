package com.example.contactbook.controller;

import com.example.contactbook.model.Contact;
import com.example.contactbook.model.User;
import com.example.contactbook.repository.ContactRepository;
import com.example.contactbook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired private ContactRepository contactRepository;
    @Autowired private UserRepository userRepository;

    // Pulls the username the JwtAuthFilter put into the security context,
    // then looks up the matching User row.
    private User currentUser(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Contact> getAll(Authentication auth,
                                 @RequestParam(required = false) String search) {
        User user = currentUser(auth);
        if (search != null && !search.isBlank()) {
            return contactRepository.findByUserAndFullNameContainingIgnoreCase(user, search);
        }
        return contactRepository.findByUser(user);
    }

    @PostMapping
    public Contact create(Authentication auth, @RequestBody Contact contact) {
        contact.setUser(currentUser(auth));
        return contactRepository.save(contact);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(Authentication auth, @PathVariable Long id, @RequestBody Contact updated) {
        User user = currentUser(auth);
        Contact existing = contactRepository.findById(id).orElse(null);

        if (existing == null || !existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Contact not found");
        }

        existing.setFullName(updated.getFullName());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        contactRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable Long id) {
        User user = currentUser(auth);
        Contact existing = contactRepository.findById(id).orElse(null);

        if (existing == null || !existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(404).body("Contact not found");
        }

        contactRepository.delete(existing);
        return ResponseEntity.ok().build();
    }
}
