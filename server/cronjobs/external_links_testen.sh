#!/bin/sh
cd /home/bumzack/server/crawl-search/server
echo "cronjob external_links_testen startet @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log
 
node scripts/exec_external_links.js 5

echo "cronjob external_links_testen ended @  $(date)" >> /home/bumzack/server/crawl-search/server/cronjobs/cron.log
