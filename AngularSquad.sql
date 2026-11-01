-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 01, 2026 at 03:55 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `AngularSquad`
--

-- --------------------------------------------------------

--
-- Table structure for table `table_barang`
--

CREATE TABLE `table_barang` (
  `id` int(10) UNSIGNED NOT NULL,
  `nama_barang` varchar(160) NOT NULL,
  `stok` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `harga` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table_dokter`
--

CREATE TABLE `table_dokter` (
  `id_dokter` int(11) NOT NULL,
  `nama_dokter` varchar(100) NOT NULL,
  `keahlian` varchar(100) DEFAULT NULL,
  `max_layanan_harian` int(11) DEFAULT 50,
  `status_aktif` enum('Aktif','Nonaktif') DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table_dokter`
--

INSERT INTO `table_dokter` (`id_dokter`, `nama_dokter`, `keahlian`, `max_layanan_harian`, `status_aktif`) VALUES
(1, 'dr. Budi Santoso, Sp.B', 'Bedah Umum', 50, 'Aktif'),
(2, 'dr. Andi Setiawan, Sp.PD', 'Penyakit Dalam', 40, 'Aktif'),
(3, 'dr. Siti Aminah, Sp.A', 'Anak', 50, 'Aktif'),
(4, 'dr. Clara Wijaya, Sp.OG', 'Kandungan', 30, 'Aktif'),
(5, 'dr. Elvan Li, Sp.B', 'Bedah Umum', 50, 'Aktif');

-- --------------------------------------------------------

--
-- Table structure for table `table_jadwal_operasi`
--

CREATE TABLE `table_jadwal_operasi` (
  `id_jadwal_operasi` int(11) NOT NULL,
  `id_pendaftaran` int(11) DEFAULT NULL,
  `id_ruang_operasi` int(11) DEFAULT NULL,
  `id_dokter` int(11) DEFAULT NULL,
  `tanggal_operasi` date DEFAULT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL,
  `status_operasi` enum('Terjadwal','Selesai','Batal') DEFAULT 'Terjadwal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table_jadwal_operasi`
--

INSERT INTO `table_jadwal_operasi` (`id_jadwal_operasi`, `id_pendaftaran`, `id_ruang_operasi`, `id_dokter`, `tanggal_operasi`, `jam_mulai`, `jam_selesai`, `status_operasi`) VALUES
(501, 1001, 1, 5, '2026-11-01', '10:00:00', '13:00:00', 'Terjadwal');

-- --------------------------------------------------------

--
-- Table structure for table `table_menu`
--

CREATE TABLE `table_menu` (
  `id` int(10) UNSIGNED NOT NULL,
  `menu_name` varchar(120) NOT NULL,
  `url_menu` varchar(255) NOT NULL,
  `parent_id` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `table_menu`
--

INSERT INTO `table_menu` (`id`, `menu_name`, `url_menu`, `parent_id`, `is_active`) VALUES
(1, 'Dashboard', '/dashboard', 0, 1),
(2, 'Master Data', '', 0, 1),
(3, 'User Management', '/user-management', 2, 1),
(4, 'Data Barang', '/data-barang', 2, 1),
(5, 'Settings', '/settings', 0, 1),
(6, 'Master Detail', '/master-detail', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `table_pendaftaran`
--

CREATE TABLE `table_pendaftaran` (
  `id_pendaftaran` int(11) NOT NULL,
  `id_pasien` int(11) DEFAULT NULL,
  `id_dokter` int(11) DEFAULT NULL,
  `tanggal_daftar` date DEFAULT NULL,
  `jenis_layanan` enum('Rawat Jalan','Rawat Inap','Operasi') DEFAULT NULL,
  `status_validasi` enum('Pending','Approved','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table_pendaftaran`
--

INSERT INTO `table_pendaftaran` (`id_pendaftaran`, `id_pasien`, `id_dokter`, `tanggal_daftar`, `jenis_layanan`, `status_validasi`) VALUES
(1001, 8821, 5, '2026-11-01', 'Operasi', 'Approved'),
(1002, 8822, 5, '2026-11-01', 'Rawat Jalan', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `table_privilege_user`
--

CREATE TABLE `table_privilege_user` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_user` int(10) UNSIGNED NOT NULL,
  `id_menu` int(10) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `load` tinyint(1) NOT NULL DEFAULT 1,
  `create` tinyint(1) NOT NULL DEFAULT 0,
  `update` tinyint(1) NOT NULL DEFAULT 0,
  `delete` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table_user`
--

CREATE TABLE `table_user` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `role` varchar(60) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `table_user`
--

INSERT INTO `table_user` (`id`, `name`, `email`, `role`, `username`, `password_hash`) VALUES
(1, 'admin', 'admin@gmail.com', 'administrator', 'admin', '$2a$12$u99xgyhT8tZ91OIaXhhYZOhv2w16kBf690BrrHgP9nFE7oqHCH20i');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `table_barang`
--
ALTER TABLE `table_barang`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `table_dokter`
--
ALTER TABLE `table_dokter`
  ADD PRIMARY KEY (`id_dokter`);

--
-- Indexes for table `table_jadwal_operasi`
--
ALTER TABLE `table_jadwal_operasi`
  ADD PRIMARY KEY (`id_jadwal_operasi`),
  ADD KEY `id_pendaftaran` (`id_pendaftaran`),
  ADD KEY `id_dokter` (`id_dokter`);

--
-- Indexes for table `table_menu`
--
ALTER TABLE `table_menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `table_pendaftaran`
--
ALTER TABLE `table_pendaftaran`
  ADD PRIMARY KEY (`id_pendaftaran`),
  ADD KEY `id_dokter` (`id_dokter`);

--
-- Indexes for table `table_privilege_user`
--
ALTER TABLE `table_privilege_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `table_user`
--
ALTER TABLE `table_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_table_user_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `table_barang`
--
ALTER TABLE `table_barang`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table_dokter`
--
ALTER TABLE `table_dokter`
  MODIFY `id_dokter` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `table_jadwal_operasi`
--
ALTER TABLE `table_jadwal_operasi`
  MODIFY `id_jadwal_operasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=502;

--
-- AUTO_INCREMENT for table `table_menu`
--
ALTER TABLE `table_menu`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `table_pendaftaran`
--
ALTER TABLE `table_pendaftaran`
  MODIFY `id_pendaftaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `table_privilege_user`
--
ALTER TABLE `table_privilege_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table_user`
--
ALTER TABLE `table_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `table_jadwal_operasi`
--
ALTER TABLE `table_jadwal_operasi`
  ADD CONSTRAINT `table_jadwal_operasi_ibfk_1` FOREIGN KEY (`id_pendaftaran`) REFERENCES `Pendaftaran` (`id_pendaftaran`) ON DELETE CASCADE,
  ADD CONSTRAINT `table_jadwal_operasi_ibfk_2` FOREIGN KEY (`id_dokter`) REFERENCES `Dokter` (`id_dokter`) ON DELETE CASCADE;

--
-- Constraints for table `table_pendaftaran`
--
ALTER TABLE `table_pendaftaran`
  ADD CONSTRAINT `table_pendaftaran_ibfk_1` FOREIGN KEY (`id_dokter`) REFERENCES `Dokter` (`id_dokter`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
