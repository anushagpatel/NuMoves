/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.backend.Backend.controller;

import com.backend.Backend.dto.ConversationDTO;
import com.backend.Backend.model.ChatMessage;
import com.backend.Backend.repository.ChatMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author rahul
 */
@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public ChatHistoryController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory(
            @RequestParam String userId,
            @RequestParam String otherUserId) {

        System.out.println("🔍 Fetching chat history between " + userId + " and " + otherUserId);
        List<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsers(userId, otherUserId);
        System.out.println("📝 Messages found: " + messages.size());
        return messages;
    }

    @GetMapping("/conversations/{userId}")
    public List<ConversationDTO> getUserConversations(@PathVariable String userId) {
        return chatMessageRepository.findConversationsForUser(userId);
    }

    //  Clear conversation
    @DeleteMapping("/conversations")
    public ResponseEntity<?> clearConversation(
            @RequestParam String userId,
            @RequestParam String otherUserId) {

        chatMessageRepository.deleteMessagesBetweenUsers(userId, otherUserId);
        return ResponseEntity.ok("Conversation cleared.");
    }

    //  Archive conversation
    @PostMapping("/conversations/archive")
    public ResponseEntity<?> archiveConversation(
            @RequestParam String userId,
            @RequestParam String otherUserId) {

        List<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsers(userId, otherUserId);
        for (ChatMessage msg : messages) {
            msg.setArchived(true);
        }
        chatMessageRepository.saveAll(messages);
        return ResponseEntity.ok("Conversation archived.");
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/messages/{recipientId}")
    public ChatMessage sendMessage(ChatMessage chatMessage) {
        System.out.println("⚠️ Processing message: "
                + "From: " + chatMessage.getSenderId()
                + " To: " + chatMessage.getRecipientId()
                + " Content: " + chatMessage.getContent());

        chatMessage.setTimestamp(LocalDateTime.now());
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        return savedMessage;
    }
}
