\copy (SELECT * FROM users) TO 'users.csv' WITH CSV HEADER;
\copy (SELECT * FROM markets) TO 'markets.csv' WITH CSV HEADER;
\copy (SELECT * FROM bets) TO 'bets.csv' WITH CSV HEADER;
\copy (SELECT * FROM fomo_markets) TO 'fomo_markets.csv' WITH CSV HEADER;
\copy (SELECT * FROM action_logs) TO 'action_logs.csv' WITH CSV HEADER;
