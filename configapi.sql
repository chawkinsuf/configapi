-- phpMyAdmin SQL Dump
-- version 4.2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 04, 2014 at 11:36 PM
-- Server version: 5.5.37-MariaDB-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- User: `configapi`
--

CREATE DATABASE IF NOT EXISTS `configapi`;
GRANT ALL PRIVILEGES ON `configapi`.* TO 'configapi'@'localhost' IDENTIFIED BY 'configapi';

--
-- Database: `configapi`
--

-- --------------------------------------------------------

--
-- Table structure for table `configs`
--

CREATE TABLE IF NOT EXISTS `configs` (
`id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hostname` varchar(100) NOT NULL,
  `port` smallint(5) unsigned NOT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `configs`
--

INSERT INTO `configs` (`id`, `name`, `hostname`, `port`, `username`) VALUES
(1, 'host1', 'nessus-ntp.lab.com', 1241, 'toto'),
(2, 'host2', 'nessus-xml.lab.com', 3384, 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `key` varchar(88) NOT NULL,
  `salt` varchar(44) NOT NULL,
  `token` varchar(40) DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `key`, `salt`, `token`) VALUES
(1, 'name@company.com', 'kKbCCGNEucVhMn+Odg6A+QI0r2a5s/Ct3sTFe6sTvPfA9os+YXAZuhOh5VZaz6Pv89p18YqpNwwK6JTPLZlQZg==', '5O8KK0leLMqVwZPR/7oAGSSnYokY6bgcfehcNL8IuhU=', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `configs`
--
ALTER TABLE `configs`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`), ADD KEY `hostname` (`hostname`), ADD KEY `port` (`port`), ADD KEY `username` (`username`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`,`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `configs`
--
ALTER TABLE `configs`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
