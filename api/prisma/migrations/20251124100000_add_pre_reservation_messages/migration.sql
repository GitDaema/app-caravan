-- Pre-reservation messages between guest and host, tied to caravan only
CREATE TABLE `PreReservationMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caravan_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PreReservationMessage_caravan_id_idx`(`caravan_id`),
    INDEX `PreReservationMessage_sender_id_idx`(`sender_id`),
    INDEX `PreReservationMessage_receiver_id_idx`(`receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PreReservationMessage`
  ADD CONSTRAINT `PreReservationMessage_caravan_id_fkey`
  FOREIGN KEY (`caravan_id`) REFERENCES `Caravan`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `PreReservationMessage`
  ADD CONSTRAINT `PreReservationMessage_sender_id_fkey`
  FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `PreReservationMessage`
  ADD CONSTRAINT `PreReservationMessage_receiver_id_fkey`
  FOREIGN KEY (`receiver_id`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

