package com.aesp.repository;

import com.aesp.entity.Subscription;
import com.aesp.entity.Learner;
import com.aesp.entity.Package;
import com.aesp.enums.SubscriptionStatus;
import com.aesp.enums.PaymentMethod;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {


       // Find by learner
       List<Subscription> findByLearner(Learner learner);

       // Find by learner id
       List<Subscription> findByLearnerId(Long learnerId);


       // Package related
       Optional<Subscription> findByLearnerIdAndPackageId(Long learnerId, Long packageId);

       Boolean existsByLearnerIdAndPackageId(Long learnerId, Long packageId);

       List<Subscription> findByPackageEntity(Package packageEntity);

       List<Subscription> findByPackageId(Long packageId);

       Long countByPackageId(Long packageId);

       // Status and payment
       List<Subscription> findByStatus(SubscriptionStatus status);

       Long countByStatus(SubscriptionStatus status);

       List<Subscription> findByPaymentMethod(PaymentMethod paymentMethod);

       Long countByPaymentMethod(PaymentMethod paymentMethod);


       // Date filters
       List<Subscription> findByStartDateAfter(LocalDateTime date);

       List<Subscription> findByEndDateBefore(LocalDateTime date);

       List<Subscription> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

       // Custom queries
       @Query("SELECT s FROM Subscription s WHERE s.endDate < :now AND s.status = :status ")
       List<Subscription> findExpiredSubscriptions(@Param("now") LocalDateTime now,
                                                                                    @Param("status") SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.learner.id =: learnerId AND s.status = :status" + 
           "AND s.status = 'ACTIVE'" +
           "AND s.endDate > :now")
    Optional<Subscription> findActiveSubscriptionByLearner(@Param("learnerId") Long learnerId,
                                                                                    @Param("now") LocalDateTime now);

       @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE'" +
       "AND s.endDate BETWEEN :now AND :futureDate")
       List<Subscription> findSubscriptionsExpiringWithin(@Param("now") LocalDateTime now,
                                                                                     @Param("futureDate") LocalDateTime futureDate);

    @Query("SELECT s FROM Subscription s WHERE s.learner.id = :learnerId " +
           "AND (:packageId IS NULL OR s.packageEntity.id = :packageId) " +
           "AND s.status = :status ")
    Optional<Subscription> findByLearnerWithPackageAndStatus(@Param("learnerId") Long learnerId,
                                                           @Param("packageId") Long packageId,
                                                           @Param("status") SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.learner.id = :learnerId " +
           "ORDER BY s.startDate DESC")
    List<Subscription> findSubscriptionHistoryByLearner(@Param("learnerId") Long learnerId);

    // Statistics
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.status = 'ACTIVE'")
    Long countActiveSubscriptions();

    @Query("SELECT SUM(s.paymentAmount) FROM Subscription s WHERE s.status = 'ACTIVE'")
    Double getTotalActiveRevenue();

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.learner.id = :learnerId")
    Long countSubscriptionsByLearner(@Param("learnerId") Long learnerId);

    // Package popularity
    @Query("SELECT s.packageEntity, COUNT(s) FROM Subscription s " +
           "GROUP BY s.packageEntity " +
           "ORDER BY COUNT(s) DESC")
    List<Object[]> findPackagePopularity();
}