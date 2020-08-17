  
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);



// (N:1 relation) User-> Post (A user can have many post)
// db.User.hasMany(db.Post);  
// db.Post.belongsTo(db.User);
// N:M relation Post <--> Hashtag (Post can have many hashtag, one same hashtag can have many post)
// db.Post.belongsToMany(db.Hashtag,{through: 'PostHashtag'});
// db.Hashtag.belongsToMany(db.Post,{through: 'PostHashtag'});
// //N:M (!Notice: N:M relation create relational table in the middle.) 
// //User <--> User ( A user can have many followers, and follower also can have many followers)
// db.User.belongsToMany(db.User,{
//   foreignKey: 'followingId', //middle table colume name (link)
//   as: 'Followers', 
//   through:'Follow', //middle table name
// });
// //User <--> User ( A user can follow many people, and follower also can follow many people)
// db.User.belongsToMany(db.User,{
//   foreignKey: 'followerId',//middle table colume name(link)
//   as:'Followings', //  Join method option. Based on name of the as,(Followings) create getFollowins, addFollowing, addFollower .. methods 
//   through:'Follow' //middle table name
// });

module.exports = db;
