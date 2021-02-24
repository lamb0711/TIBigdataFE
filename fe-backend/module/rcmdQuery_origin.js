const express = require("express");
const router = express.Router();
const Keywords = require("../models/rcmd");
const Res = require("../models/Res");
router.get("/", (req, res) => {
  res.send("rcmdQuery");
});

router.get("/test", (req, res) => {
  console.log("work!");
  let id = "5de1134ab53863d63aa55309";
  Keywords.findOne({ docID: id }, (error, val) => {
    if (error) {
      console.log(error);
    }
    // console.log(val)
    res.json(val);
  });
});

router.post("/getRcmdTbl", (req, res) => {
  let ids = req.body["id"];

  console.log("post getRcmdTbl");
  console.log(ids);
  console.log(typeof ids);
  let num = req.body["num"]; //could be undefined if does not request specific num.
  if (num == undefined) num = 6;
  else {
    num = parseInt(num);
    num++; //자기 자신 지워야 한다. 코사인 유사도는 자기 자신에 대해서 가장 높은 값.
  }
  let isSim = req.body["sim"];
  let matchQuery = undefined;

  if (typeof ids == "string")
    //only send one string
    matchQuery = { docID: ids };
  //when send string array
  else matchQuery = { docID: { $in: ids } };
  // if (typeof (ids) == "string")//only send one string
  //     matchQuery = { $and: [{ docID: ids }, { $ne: [{ $arrayElemAt: ["$rcmd", 0] }, ids] }] }

  // else //when send string array
  //     matchQuery = { $and: [{ docID: { $in: ids } }, { $ne: [{ $arrayElemAt: ["$rcmd", 0] }, ids] }] }

  // console.log("right b4 equey")
  console.log(matchQuery);
  // Keywords.aggregate(
  //     [
  //         {
  //             $match: matchQuery
  //         },
  //         {
  //             $project: {
  //                 docID: 1,
  //                 rcmd: { $slice: ["$rcmd", num] }
  //             }
  //         },
  //         {
  //             $unwind: "$rcmd"
  //         },

  //     ], (err, doc) => {
  //         console.log("till unwind : ", doc)
  //     })
  // Keywords.aggregate(
  //     [
  //         {
  //             $match: matchQuery
  //         },
  //         {
  //             $project: {
  //                 docID: 1,
  //                 rcmd: { $slice: ["$rcmd", num] }
  //             }
  //         },
  //         {
  //             $unwind: "$rcmd"
  //         },
  //         {
  //             $project: {
  //                 docID: 1,
  //                 rcmd: {
  //                     $filter: {
  //                         input: "$rcmd",
  //                         cond: {
  //                             $ne: [{ $arrayElemAt: ["$rcmd", 0] }, ids]
  //                         }
  //                     }
  //                 },
  //             }
  //         },
  //         {
  //             $project: {
  //                 docID: 1,
  //                 rcmd: {
  //                     $cond: {
  //                         if: isSim,
  //                         then: "$rcmd",
  //                         else: { $arrayElemAt: ["$rcmd", 0] }

  //                     }
  //                 }
  //             }
  //         },

  //     ], (err, doc) => {
  //         console.log("till project", doc)
  //     })
  Keywords.aggregate(
    [
      {
        $match: matchQuery,
      },
      {
        $project: {
          docID: 1,
          rcmd: { $slice: ["$rcmd", num] },
        },
      },
      {
        $unwind: "$rcmd",
      },
      {
        $project: {
          docID: 1,
          rcmd: {
            $filter: {
              input: "$rcmd",
              cond: {
                $ne: [{ $arrayElemAt: ["$rcmd", 0] }, ids],
              },
            },
          },
        },
      },
      {
        $project: {
          docID: 1,
          rcmd: {
            $cond: {
              if: isSim,
              then: "$rcmd",
              else: { $arrayElemAt: ["$rcmd", 0] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$docID",
          rcmd: { $push: "$rcmd" },
          // rcmd: { $addToSet: "$rcmd" } -> cannot make a array with order
        },
      },
    ],
    (err, docs) => {
      if (err) console.error(err);
      console.log("result : ");
      console.log(docs);
      res.json(new Res(true, "response of get rcmd table ", docs));
    }
  );
});

module.exports = router;
