-- MySQL dump 10.16  Distrib 10.1.4-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: crawlscreen
-- ------------------------------------------------------
-- Server version	10.1.4-MariaDB-wsrep

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `crawl_allpages`
--

DROP TABLE IF EXISTS `crawl_allpages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_allpages` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) NOT NULL,
  `domainuid` varchar(200) NOT NULL,
  `jobuid` int(11) NOT NULL,
  `path` varchar(2000) NOT NULL,
  `htmlcode` longtext NOT NULL,
  `response` longtext NOT NULL,
  `screenshootloadtime` int(11) DEFAULT NULL,
  `imgdirectory` varchar(2000) DEFAULT NULL,
  `imgfilename` varchar(2000) DEFAULT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) DEFAULT NULL,
  `deleted` bigint(20) DEFAULT NULL,
  UNIQUE KEY `uid` (`uid`),
  KEY `domainuid` (`domainuid`),
  KEY `jobuid` (`jobuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_allpages`
--

LOCK TABLES `crawl_allpages` WRITE;
/*!40000 ALTER TABLE `crawl_allpages` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_allpages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_blacklist`
--

DROP TABLE IF EXISTS `crawl_blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_blacklist` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) NOT NULL,
  `word` varchar(200) NOT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) NOT NULL,
  `deleted` bigint(20) NOT NULL,
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_blacklist`
--

LOCK TABLES `crawl_blacklist` WRITE;
/*!40000 ALTER TABLE `crawl_blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_domains`
--

DROP TABLE IF EXISTS `crawl_domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_domains` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `hostname` varchar(400) DEFAULT NULL,
  `cronjob` tinyint(1) DEFAULT NULL,
  `created` bigint(20) DEFAULT NULL,
  `updated` bigint(20) DEFAULT NULL,
  `deleted` bigint(20) DEFAULT NULL,
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_domains`
--

LOCK TABLES `crawl_domains` WRITE;
/*!40000 ALTER TABLE `crawl_domains` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_jobs`
--

DROP TABLE IF EXISTS `crawl_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_jobs` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) DEFAULT NULL,
  `domainuid` int(11) NOT NULL,
  `jobtype` varchar(2000) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `starttime` bigint(20) NOT NULL,
  `endtime` bigint(20) NOT NULL,
  `status` varchar(300) NOT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) NOT NULL,
  `deleted` bigint(20) NOT NULL,
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_jobs`
--

LOCK TABLES `crawl_jobs` WRITE;
/*!40000 ALTER TABLE `crawl_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_pagecontent`
--

DROP TABLE IF EXISTS `crawl_pagecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_pagecontent` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) NOT NULL,
  `domainuid` varchar(200) NOT NULL,
  `jobuid` int(11) NOT NULL,
  `pageuid` int(11) NOT NULL,
  `contenttype` varchar(30) NOT NULL,
  `contenttext` varchar(10000) NOT NULL,
  `linktarget` varchar(500) DEFAULT NULL,
  `linkurl` varchar(500) DEFAULT NULL,
  `cssid` varchar(500) DEFAULT NULL,
  `cssclass` varchar(500) DEFAULT NULL,
  `inwordlist` tinyint(1) DEFAULT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) DEFAULT NULL,
  `deleted` bigint(20) DEFAULT NULL,
  `status` varchar(4000) DEFAULT NULL,
  UNIQUE KEY `uid` (`uid`),
  KEY `domainuid` (`domainuid`),
  KEY `jobuid` (`jobuid`),
  KEY `pageuid` (`pageuid`),
  KEY `contenttype` (`contenttype`),
  KEY `inwordlist` (`inwordlist`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_pagecontent`
--

LOCK TABLES `crawl_pagecontent` WRITE;
/*!40000 ALTER TABLE `crawl_pagecontent` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_pagecontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_screenshotcomparison`
--

DROP TABLE IF EXISTS `crawl_screenshotcomparison`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_screenshotcomparison` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `useruid` int(11) NOT NULL,
  `domainuid` varchar(200) NOT NULL,
  `jobuid` int(11) NOT NULL,
  `path` varchar(2000) NOT NULL,
  `img1uid` int(11) DEFAULT NULL,
  `img2uid` int(11) DEFAULT NULL,
  `imgdirectory` varchar(2000) DEFAULT NULL,
  `imgfilename` varchar(2000) DEFAULT NULL,
  `imgdirectoryallinone` varchar(2000) DEFAULT NULL,
  `imgfilenameallinone` varchar(2000) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `countPixel` int(11) DEFAULT NULL,
  `percDiff` double DEFAULT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) NOT NULL,
  `deleted` bigint(20) NOT NULL,
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_screenshotcomparison`
--

LOCK TABLES `crawl_screenshotcomparison` WRITE;
/*!40000 ALTER TABLE `crawl_screenshotcomparison` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_screenshotcomparison` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_seowords`
--

DROP TABLE IF EXISTS `crawl_seowords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_seowords` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(250) DEFAULT NULL,
  `wordstem` varchar(250) DEFAULT NULL,
  `created` bigint(20) NOT NULL,
  `deleted` bigint(20) DEFAULT NULL,
  UNIQUE KEY `uid` (`uid`),
  KEY `word` (`word`),
  KEY `wordstem` (`wordstem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_seowords`
--

LOCK TABLES `crawl_seowords` WRITE;
/*!40000 ALTER TABLE `crawl_seowords` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_seowords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_seowords_used_in_pagecontent`
--

DROP TABLE IF EXISTS `crawl_seowords_used_in_pagecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_seowords_used_in_pagecontent` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `worduid` int(11) NOT NULL,
  `pagecontentuid` int(11) NOT NULL,
  `created` bigint(20) NOT NULL,
  `deleted` bigint(20) DEFAULT NULL,
  UNIQUE KEY `uid` (`uid`),
  KEY `worduid` (`worduid`),
  KEY `pagecontentuid` (`pagecontentuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_seowords_used_in_pagecontent`
--

LOCK TABLES `crawl_seowords_used_in_pagecontent` WRITE;
/*!40000 ALTER TABLE `crawl_seowords_used_in_pagecontent` DISABLE KEYS */;
/*!40000 ALTER TABLE `crawl_seowords_used_in_pagecontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crawl_user`
--

DROP TABLE IF EXISTS `crawl_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crawl_user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(300) NOT NULL,
  `lastname` varchar(300) NOT NULL,
  `username` varchar(300) NOT NULL,
  `password` varchar(128) NOT NULL,
  `shortname` varchar(30) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `accessrights` varchar(500) NOT NULL,
  `color` varchar(20) NOT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) NOT NULL,
  `deleted` bigint(20) NOT NULL,
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crawl_user`
--

LOCK TABLES `crawl_user` WRITE;
/*!40000 ALTER TABLE `crawl_user` DISABLE KEYS */;
INSERT INTO `crawl_user` VALUES (1,'','','admin','c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec','',1,'','',0,0,0),(2,'','','readonlyuser','a75faf1916b78a3e5700513091e539b4a621994453d0f69cda4f1aa1ff005d9871b643534e2bf5826062c89eee220f45d7ccc319455058ea209541e1d1a232f7','',0,'PAGE_ANALYTICS,PAGE_SEO','',0,0,0);
/*!40000 ALTER TABLE `crawl_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-05-18 20:45:32
