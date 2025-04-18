mkdir data/ssl -p

# Change this to your domain
cp /etc/letsencrypt/live/goofy.media/fullchain.pem data/ssl/cert.pem
cp /etc/letsencrypt/live/goofy.media/privkey.pem data/ssl/key.pem

npm run db:migrate

exec node api/index.js SSL
