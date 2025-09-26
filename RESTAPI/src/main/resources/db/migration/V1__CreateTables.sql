CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email    VARCHAR(100) NOT NULL UNIQUE,
  role     VARCHAR(50) NOT NULL,
  blocked   BOOLEAN NOT NULL DEFAULT FALSE,
  enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  verification_code VARCHAR(50) NOT NULL,
  verification_expired TIMESTAMP NOT NULL

);


CREATE TABLE hand_histories (
  id           SERIAL PRIMARY KEY,
  site         VARCHAR(100)   NOT NULL,
  filename     VARCHAR(255)   NOT NULL,
  date_in_file TIMESTAMP      NOT NULL,
  uploaded     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  format       VARCHAR(50)    NOT NULL,
  username     VARCHAR(50)    NOT NULL,
  verified     BOOLEAN        NOT NULL DEFAULT FALSE,
  FOREIGN KEY (username) REFERENCES users(username)
);

