-- Server version: 8.0.30-mysql

--
-- Database: `projektarbeit`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--



CREATE TABLE `users` (
  userID int unsigned not null auto_increment primary key,
  `name` varchar(255) DEFAULT NOT NULL,
  `lastname` varchar(255) DEFAULT NOT NULL,
  `username` varchar(255) DEFAULT NOT NULL,
  `email` varchar(255) DEFAULT NOT NULL,
  `password` varchar(255) DEFAULT NOT NULL,
  `role` varchar(255) DEFAULT NOT NULL,
  `ischecked` bit(1) DEFAULT NOT NULL,
  `isLogged` bit(1) DEFAULT NOT NULL,
  `token` TEXT DEFAULT NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- AUTO_INCREMENT for table `users`
--

ALTER TABLE `users`
  MODIFY `userID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;


--
-- Database: `projektarbeit`
--
CREATE DATABASE IF NOT EXISTS `projektarbeit` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `projektarbeit`;

-- --------------------------------------------------------

--
-- Table structure for table `Film`
--

CREATE TABLE `Film` (
  `Filmtitel` varchar(50) NOT NULL,
  `Tonformat` varchar(10) DEFAULT NULL,
  `Bildformat` varchar(5) DEFAULT NULL,
  `Bildfrequenz` varchar(10) DEFAULT NULL,
  `Farbtiefe` varchar(10) DEFAULT NULL,
  `Videocontainer` varchar(1000) DEFAULT NULL,
  `Tonspurbelegung` varchar(2) DEFAULT NULL,
  `Timecode Anfang` varchar(11) DEFAULT NULL,
  `Timecode Ende` varchar(11) DEFAULT NULL,
  `Dauer` varchar(11) DEFAULT NULL,
  `Videocodec` varchar(15) DEFAULT NULL,
  `Auflösung` varchar(10) DEFAULT NULL,
  `Vorschaubild` varchar(1000) DEFAULT NULL,
  `Erscheinungsdatum` date NOT NULL,
  `Autor` varchar(300) DEFAULT NULL,
  `Programmtyp` varchar(20) NOT NULL,
  `Erzählsatz` text NOT NULL,
  `Bemerkung` varchar(200) DEFAULT NULL,
  `Erstellungsdatum` date NOT NULL,
  `Mitwirkende` varchar(1000) NOT NULL,
  `Bewertungen` varchar(200) DEFAULT NULL,
  `Upload` date NOT NULL,
  `Klasse` varchar(10) DEFAULT NULL,
  `Status` varchar(15) NOT NULL,
  `Lehrjahr` int(11) NOT NULL,
  `Stichworte` text NOT NULL,
  `ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Initial';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Film`
--
ALTER TABLE `Film`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Film`
--
ALTER TABLE `Film`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
