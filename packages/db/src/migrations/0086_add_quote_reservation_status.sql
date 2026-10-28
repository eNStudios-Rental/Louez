ALTER TABLE `reservations` MODIFY COLUMN `reservation_status` enum('pending','confirmed','ongoing','completed','cancelled','rejected','quote','declined') NOT NULL DEFAULT 'pending';

