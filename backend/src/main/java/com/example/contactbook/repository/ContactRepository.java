package com.example.contactbook.repository;

import com.example.contactbook.model.Contact;
import com.example.contactbook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    // Every query is scoped to a user so one account never sees another's contacts.
    List<Contact> findByUser(User user);
    List<Contact> findByUserAndFullNameContainingIgnoreCase(User user, String name);
}
