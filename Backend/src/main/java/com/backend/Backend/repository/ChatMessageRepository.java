/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.backend.Backend.repository;

import com.backend.Backend.dto.ConversationDTO;
import com.backend.Backend.model.ChatMessage;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author rahul
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderId = :userId1 AND m.recipientId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.recipientId = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findMessagesBetweenUsers(@Param("userId1") String userId1,
                                               @Param("userId2") String userId2);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE " +
           "(m.senderId = :userId1 AND m.recipientId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.recipientId = :userId1)")
    void deleteMessagesBetweenUsers(@Param("userId1") String userId1,
                                    @Param("userId2") String userId2);

@Query(value =
       "SELECT DISTINCT " +
       "CASE WHEN cm.sender_id = :userId THEN cm.recipient_id ELSE cm.sender_id END AS userId, " +
       "(SELECT content FROM chat_message " +
       " WHERE ((sender_id = cm.sender_id AND recipient_id = cm.recipient_id) OR " +
       "       (sender_id = cm.recipient_id AND recipient_id = cm.sender_id)) " +
       " ORDER BY timestamp DESC LIMIT 1) AS lastMessage, " +
       "(SELECT timestamp FROM chat_message " +
       " WHERE ((sender_id = cm.sender_id AND recipient_id = cm.recipient_id) OR " +
       "       (sender_id = cm.recipient_id AND recipient_id = cm.sender_id)) " +
       " ORDER BY timestamp DESC LIMIT 1) AS lastTimestamp " +
       "FROM chat_message cm " +
       "WHERE (cm.sender_id = :userId OR cm.recipient_id = :userId) " +
       "AND (cm.sender_id != cm.recipient_id) " + // Exclude self-messages
       "ORDER BY lastTimestamp DESC",
       nativeQuery = true)
    List<Object[]> findConversationsForUserRaw(@Param("userId") String userId);

default List<ConversationDTO> findConversationsForUser(String userId) {
    List<Object[]> results = findConversationsForUserRaw(userId);
    return results.stream()
            .map(result -> new ConversationDTO(
                    (String) result[0],
                    "User " + result[0],
                    (String) result[1],
                    result[2] != null ? result[2].toString() : null
            ))
            .collect(java.util.stream.Collectors.toList());
}
}


