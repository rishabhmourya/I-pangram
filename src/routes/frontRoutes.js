const express = require('express');
const frontController = require('../controllers/frontController');


const frontRouter = express.Router();
function router() {
    const { middleware, like, viewLike, viewComment, addComment, requestList, deletePost, addPost, removeFriend, friendList, accept, reject, sendReq, search, editName, main, edit, } = frontController();

    frontRouter.route('/')
        .get((req, res) => {

            res.render('index', {

            });
        });

    frontRouter.route('/login')
        .get((req, res) => {
            res.render('login', {
            });
        });
    frontRouter.route('/signUp')
        .get((req, res) => {
            res.render('signUp', {
            });
        });

    frontRouter.route('/main')
        .all(middleware)
        .get(main);

    frontRouter.route('/edit')
        .all(middleware)
        .get(edit)


    frontRouter.route('/requestList')
        .all(middleware)
        .get(requestList)

    frontRouter.route('/sendReq/:id')
        .all(middleware)
        .get(sendReq);

    frontRouter.route('/accept/')
        .all(middleware)
        .get(accept);

    frontRouter.route('/reject/')
        .all(middleware)
        .get(reject);

    frontRouter.route('/friendList')
        .all(middleware)
        .get(friendList);

    frontRouter.route('/removeFriend')
        .all(middleware)
        .get(removeFriend);

    frontRouter.route('/deletePost/:id')
        .all(middleware)
        .get(deletePost);

    frontRouter.route('/like/:id')
        .all(middleware)
        .get(like);
        
    frontRouter.route('/viewlike/:id')
        .all(middleware)
        .get(viewLike);
        
    frontRouter.route('/viewComment/:id')
        .all(middleware)
        .get(viewComment);


    frontRouter.route('/logout')
        .all(middleware)
        .get((req, res) => {
            req.logOut();

            req.session.destroy(function (err) {
                res.redirect('/');
            });
        });


    frontRouter.route('/search')
        .all(middleware)
        .post(search)

    frontRouter.route('/addPost')
        .all(middleware)
        .post(addPost)


    frontRouter.route('/addComment')
        .all(middleware)
        .post(addComment)

    frontRouter.route('/editName')
        .all(middleware)
        .put(editName);





    return frontRouter;
}
module.exports = router;

