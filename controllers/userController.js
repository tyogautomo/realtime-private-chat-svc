const { User } = require('../models/userModel');

class UserController {
    static async createUser(req, res) {
        try {
            const { username, password } = req.body;
            const payload = { username, password };
            const user = await User.create(payload);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async signIn(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User
                .findOne({ username })
                .populate({
                    path: 'activeChats',
                    model: 'Room',
                    select: '-__v -createdAt',
                    populate: {
                        path: 'participants',
                        model: 'User',
                        select: 'username'
                    }
                })
                .select('-__v');
            if (user && (password === user.password)) {
                const payload = { ...user._doc };
                delete payload.password;
                res.status(200).json(payload);
            } else {
                res.status(401).json({
                    code: 401,
                    message: 'Wrong username/password'
                });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getActiveChats(userId) {
        try {
            const user = await User
                .findOne({ _id: userId })
                .populate({
                    path: 'activeChats',
                    model: 'Room',
                    select: '-__v -createdAt',
                    populate: [
                        {
                            path: 'participants',
                            model: 'User',
                            select: 'username'
                        },
                        {
                            path: 'lastMessage',
                            model: 'Message',
                            select: 'message'
                        }
                    ]
                })
                .select('-__v');
            if (user) {
                return user.activeChats;
            } else {
                console.log({
                    code: 404,
                    message: 'user not found.'
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = { UserController };
