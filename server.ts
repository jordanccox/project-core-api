import express = require('express');
import mongoose = require('mongoose');
import cors = require('cors');
import passport = require('passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());


