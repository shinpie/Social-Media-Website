const userCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectId
const User = require("../models/User")

let Follow = function(followedUsername, authorId) {
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors= []
}

Follow.prototype.cleanUp = function() {
    if (typeof(this.followedUsername) != "string") {this.followedUsername = ""}
}

Follow.prototype.validate = async function(action) {
    //followed user must exist in db
    let followedAccount = await userCollection.findOne({username: this.followedUsername})

    if (followedAccount._id == this.authorId) {
        if (action == "create") { 
            this.errors.push("You cannot follow Yourself.")
        } else if (action == "delete") { 
            this.errors.push("You cannot unfollow Yourself.")
        }
    } 
    
    if (followedAccount) {
        this.followedId  = followedAccount._id
    } else { 
        this.errors.push("You cannot follow a user that does not exist.")
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})   
    if (action == "create") { 
        if(doesFollowAlreadyExist) {
            this.errors.push("You are already following this user.")
        }
    } else if (action == "delete") { 
        if(!doesFollowAlreadyExist) {
            this.errors.push("You can not unfollow a user if you are not already follwoing that user.")
        }
    }
}

Follow.prototype.create = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        let action = "create" 
        await this.validate(action)
        if (!this.errors.length) {
            await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })
} 

Follow.prototype.delete = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        let action = "delete" 
        await this.validate(action)
        if (!this.errors.length) {
            await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })
} 

Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followDoc = await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})
    if (followDoc) {
        return true
    } else {
        return false
    }
}

Follow.getFollowersByID = function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let followers = await followsCollection.aggregate([
                {$match: {followedId: id}},
                {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()
            followers = followers.map(function(follower) {
                let user = new User(follower, true)
                return{username: follower.username, avatar: user.avatar}
            })
            resolve(followers)
        }  catch {
            reject()
        }
    })
}

Follow.getFollowingByID = function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let followings = await followsCollection.aggregate([
                {$match: {authorId: id}},
                {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()
            followings = followings.map(function(following) {
                let user = new User(following, true)
                return{username: following.username, avatar: user.avatar}
            })
            resolve(followings)
        }  catch {
            reject()
        }
    })
}


Follow.countFollowerById = function(id) {
    return new Promise(async (resolve, reject) => {
        let followersCount = await followsCollection.countDocuments({followedId: id})
        resolve(followersCount)
    })
}

Follow.countFollowingById = function(id) {
    return new Promise(async (resolve, reject) => {
        let followingCount = await followsCollection.countDocuments({authorId: id})
        resolve(followingCount)
    })
}

module.exports = Follow