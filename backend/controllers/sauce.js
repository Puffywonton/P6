const fs = require('fs');
const Sauce = require('../models/sauce');

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'sauce saved'})})
    .catch(error => { res.status(400).json( { error })})
};



exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId; //mesure de securite

  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'sauce saved'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};


exports.likeSauce = (req, res, next) => {
  console.log(req.body)
  const userId = req.body.userId;
  const like = req.body.like;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        const userLiked = sauce.usersLiked.findIndex(user => user == userId);
        const userDisliked = sauce.usersDisliked.findIndex(user => user == userId);
        if (userLiked == -1 && userDisliked == -1) {
          if (like > 0) {
            sauce.usersLiked.push(userId);
          }
          if (like < 0) {
            sauce.usersDisliked.push(userId);
          }
          sauce.likes = sauce.usersLiked.length;
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save()
            .then(() => { res.status(201).json({message: 'sauce saved'})})
            .catch(error => { res.status(400).json( { error })})
        }
        
        if (userLiked != -1 && userDisliked == -1) {
          console.log("user liked sauce already")
          if (like > 0) {
            res.status(400).json({message: 'cannot relike a sauce'}) //bonne error? 400 a verif
          }
          if (like < 0) {
            sauce.usersLiked.splice(userLiked, 1)
            sauce.usersDisliked.push(userId)
          }
          if (like == 0) {
            sauce.usersLiked.splice(userLiked, 1)
          }
          sauce.likes = sauce.usersLiked.length;
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save()
            .then(() => { res.status(201).json({message: 'sauce saved'})})
            .catch(error => { res.status(400).json( { error })})
        }

        if (userLiked == -1 && userDisliked != -1) {
          console.log("user disliked sauce already")
          if (like > 0) {
            sauce.usersDisliked.splice(userDisliked, 1)
            sauce.usersLiked.push(userId)
          }
          if (like < 0) {
            res.status(400).json({message: 'cannot redislike a sauce'}) //bonne error? 400 a verif
          }
          if (like == 0) {
            sauce.usersDisliked.splice(userDisliked, 1)
          }
          sauce.likes = sauce.usersLiked.length;
          sauce.dislikes = sauce.usersDisliked.length;
          sauce.save()
            .then(() => { res.status(201).json({message: 'sauce saved'})})
            .catch(error => { res.status(400).json( { error })})
        }
      })  
};
