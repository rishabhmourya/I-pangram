const express = require('express');
let Router = express.Router();
let path = require('path');
const { ObjectID } = require('mongodb');


function frontController() {

    function middleware(req, res, next) {
        if (req.session.passport) {
            next();
        } else {
            res.redirect('/');
        }
    }
    function edit(req, res) {


        res.render('edit');


    }
    function editName(req, res) {
        const match = req.user.email;

        let { lastName } = req.body;


        (async function () {
            let col = req.app.users;

            const result = await col.find({ "email": match }).toArray();
            if (result[0]) {

                try {
                    const finalUpdate = await col.updateOne({ "email": match },
                        { $set: { lastName: lastName } }
                    );


                    req.flash('success', ` Profile  successfully Updated.`);
                    res.redirect('/main');

                } catch (error) {
                    console.log(error);
                }


            } else {
                res.send('user not matched');
            }

        }())
    }
    function main(req, res) {
        const match = req.user.email;

        (async function mongo() {
            try {
                const col = await req.app.posts;
                const data = await col.find().sort({ _id: -1 }).toArray();


                res.render('main', {
                    data: data
                });

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function search(req, res) {
        const { search } = req.body;

        if (search == '') {
            req.flash('success', "Please fill in  Search field.");
            return res.redirect('/main');
        } else if (search.length >= 100) {
            req.flash('success', "Words limit reached, input the correct details");
            return res.redirect('/main');
        } else {


            (async function mongo() {
                try {
                    const col2 = await req.app.users;
                    const items = await col2.find({
                        $or:
                            [{ city: { $regex: search, $options: "$i" } },
                            { state: { $regex: search, $options: "$i" } }

                            ]
                    }).toArray();
                    res.render('searchResult', {
                        items: items,

                    });



                } catch (error) {
                    console.log(`this is happening ${error} `);
                }

            }());
        }


    }
    function sendReq(req, res) {
        const id = req.params.id;

        (async function mongo() {
            try {
                const col2 = req.app.users;
                const result = await col2.findOne({ _id: ObjectID(id) });

                //checking recived request
                let arr = result.reqRecived;
                let name = req.user.firstName;
                const insert = arr.push(name);
                const update = await col2.findOneAndUpdate({ _id: ObjectID(id) },
                    { $set: { reqRecived: arr } });

                req.flash('success', `Request sent to ${result.firstName} succesfully`);
                res.redirect('/main');
            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());


    }
    function requestList(req, res) {
        const match = req.user.email;

        (async function mongo() {
            try {
                const col = req.app.users;
                const user = await col.findOne({ email: match });
                res.render('requestList', {
                    user: user
                });

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function accept(req, res) {
        let email = req.user.email;
        let name = req.user.firstName;
        let action = req.query.action;
        (async function mongo() {
            try {

                const col = req.app.users;
                const user = await col.findOne({ "email": email });
                //adding to the friend list
                let add = user.friendList;
                let push = add.push(action);

                //removing name from the reqRecived list
                let remove = user.reqRecived;
                const index = remove.indexOf(action);
                if (index > -1) {

                    remove.splice(index, 1);
                }
                //pushing update in our acc
                const finalUpdate = await col.updateOne({ "email": email },
                    { $set: { friendList: add, reqRecived: remove } }
                );
                // pushing update in the acc of requester

                const requester = await col.findOne({ "firstName": action });

                let friendListOfRequester = requester.friendList;
                let PushingUpdateForRequester = friendListOfRequester.push(name)

                const updateForRequesterFinal = await col.updateOne({ "firstName": action },
                    { $set: { friendList: friendListOfRequester } }
                );

                req.flash('success', ` Request accepted.`);
                res.redirect('/main');
            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function reject(req, res) {
        let email = req.user.email;
        let action = req.query.action;

        (async function mongo() {
            try {
                const col = req.app.users;
                const user = await col.findOne({ "email": email });
                let gettingOurRequestList = user.reqRecived;
                //removing name from the reqRecived list
                const index = gettingOurRequestList.indexOf(action);

                if (index > -1) {

                    gettingOurRequestList.splice(index, 1);
                }
                //pushing update in our acc
                const finalUpdate = await col.updateOne({ "email": email },
                    { $set: { reqRecived: gettingOurRequestList } }
                );
                req.flash('success', ` Request rejected.`);
                res.redirect('/main');

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());

    }
    function friendList(req, res) {
        const email = req.user.email;
        (async function mongo() {
            try {
                const col2 = await req.app.users;
                const ourAcc = await col2.findOne({ "email": email });

                let data = ourAcc.friendList;

                res.render('friendList', {
                    data: data,

                });
            } catch (error) {
                console.log(`this is happening ${error} `);
            }
        }());
    }
    function removeFriend(req, res) {
        let email = req.user.email;
        let name = req.user.firstName;

        let action = req.query.action;

        (async function mongo() {
            try {
                const col = req.app.users;
                const user = await col.findOne({ "email": email });
                let gettingOurFriendList = user.friendList;

                //removing name from the reqRecived list
                const index = gettingOurFriendList.indexOf(action);
                if (index > -1) {
                    gettingOurFriendList.splice(index, 1);
                }

                //pushing update in our acc
                const finalUpdate = await col.updateOne({ "email": email },
                    { $set: { friendList: gettingOurFriendList } }
                );

                //Now removing name from the other person acc.
                const otherPersonAcc = await col.findOne({ "firstName": action });
                let otherPersonFriendList = otherPersonAcc.friendList;

                const indexOfOtherPersonAcc = otherPersonFriendList.indexOf(name);
                if (indexOfOtherPersonAcc > -1) {
                    otherPersonFriendList.splice(indexOfOtherPersonAcc, 1);
                }

                //pushing update in  to other person acc
                const updateForOtherPersonAcc = await col.updateOne({ "firstName": action },
                    { $set: { friendList: otherPersonFriendList } }
                );


                req.flash('success', `Removed form the friendList.`);
                res.redirect('/main');

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());

    }
    function addPost(req, res) {
        const { addPost } = req.body;

        const name = req.user.firstName;
        const email = req.user.email;

        if (addPost == '') {
            req.flash('success', "Post feild cannot be empty.");
            return res.redirect('/main');
        } else if (addPost.length >= 100) {
            req.flash('success', "Words limit is 100, input the correct details");
            return res.redirect('/main');
        } else {

            (async function mongo() {
                try {
                    let like = [];
                    let comment = [];
                    const col2 = await req.app.posts;
                    const items = await col2.insertOne({ name, email, addPost, like, comment });

                    req.flash('success', `Posted successfully`);
                    res.redirect('/main');
                } catch (error) {
                    console.log(`this is happening ${error} `);
                }

            }());
        }

    }
    function deletePost(req, res) {
        let id = req.params.id;

        (async function mongo() {
            try {
                const col = req.app.posts;
                const user = await col.findOneAndDelete({ _id: ObjectID(id) });
               
                req.flash('success', ` Post Deleted Successfully.`);
                res.redirect('/main');

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function like(req, res) {
        let id = req.params.id;
        let name = req.user.firstName;
        (async function mongo() {
            try {
                const col = req.app.posts;
                const postPick = await col.findOne({ _id: ObjectID(id) });
               
                //getting like array from post 
                let likeArray = postPick.like;
                let pushLike =  likeArray.push(name)
               
                //Updating post with like
                const finalLikeUpdate = await col.findOneAndUpdate({ _id: ObjectID(id)},
                    {$set: {like:likeArray}}   
                );
               

                req.flash('success', ` Liked Successfully.`);
                res.redirect('/main');

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function addComment(req, res) {
        const { addCommentText, id } = req.body;
        let name = req.user.firstName;
        (async function mongo() {
            try {
                const col = req.app.posts;
                const postPick = await col.findOne({ _id: ObjectID(id) });
               
                //getting like array from post 
                let commentArray = postPick.comment;
                let pushComment =  commentArray.push({addCommentText,name})
               
                //Updating post with like
                const finalLikeUpdate = await col.findOneAndUpdate({ _id: ObjectID(id)},
                    {$set: {comment:commentArray}}   
                );
               

                req.flash('success', ` Commented  Successfully.`);
                res.redirect('/main');

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function viewLike(req, res) {
        let id = req.params.id;
     
        (async function mongo() {
            try {
                const col = req.app.posts;
                const postPick = await col.findOne({ _id: ObjectID(id) });
               
                let data = postPick.like;
               res.render('viewLikes',{
                    data: data,                 
               })

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    }
    function viewComment(req, res) {
        let id = req.params.id;
     
        (async function mongo() {
            try {
                const col = req.app.posts;
                const postPick = await col.findOne({ _id: ObjectID(id) });
               
                let data = postPick.comment;
               res.render('viewComments',{
                    data: data,                 
               })

            } catch (error) {
                console.log(`this is happening ${error} `);
            }

        }());
    };

    return {
        middleware,
        deletePost,
        edit,
        editName,
        main,
        search,
        sendReq,
        accept,
        like,
        addComment,
        reject,
        addPost,
        viewLike,
        viewComment,
        friendList,
        requestList,
        removeFriend,

    };
}

module.exports = frontController;