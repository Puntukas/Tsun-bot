// add disconnect protection, 10 minute grace period?
// add !War game to swap slots with the challenger
// auto-woot broken?
// managers+ get 2x time max AFK detection
// !messages aren't deleted anymore?

log("Loading bot...");

var curdate                 = new Date();

var lotteryEnabled          = (typeof lotteryEnabled === "undefined")        ? true  : false;
var blackJackEnabled        = (typeof blackJackEnabled === "undefined")      ? false : true;//(curdate.getDay() != 3 && curdate.getDay() != 6);// disable by default on meet-up days
var ReminderEnabled         = (typeof ReminderEnabled === "undefined")       ? false : true;//(curdate.getDay() == 3 || curdate.getDay() == 6);// disable reminder on non-meet days to prevent spam
var GreetingEnabled         = (curdate.getDay() != 3 && curdate.getDay() != 6);// disable by default on meet-up days
var checkSPAMEnabled        = (typeof checkSPAMEnabled === "undefined")      ? true  : checkSPAMEnabled;
var SpecialGreetingEnabled  = false;
var SpecialEventLockdown    = false;

var version                 = "BETA!";
var meetupUrl               = "http://tsunplugdj.weebly.com/";
var SpecialGreeting         = "This room is dedicated to relax and have a good time! Room rules and permissible room genres: http://tinyurl.com/thesoundsyouneed Channels and OP List: http://tinyurl.com/thesoundsyouneed1";

var trackAFKs               = (typeof trackAFKs === "undefined")? [] : trackAFKs;// format: array[0=>username, 1=>userID, 2=>time of last msg, 3=>message data/txt, 4=bool warned or not]
var blackJackUsers          = [];// format: array[0=>userID, 1=> wager, 2=>user's hand array[card1, card2, ...], 3=>dealer's hand array[card1, card2, ...], 4=> deck array[0-51], 5=> active game bool false|true if game over, 6=> bool false|true if cards faceup, 7=>stand bool false|true=!stand called/forced]
var upvotes                 = ["upchode", "upgrope", "upspoke", "uptoke", "upbloke", "upboat", "upgoat", "uphope", "uppope"];
var afkNames                = ["Discipliner", "Decimator", "Slayer", "Obliterator", "Enforcer"];
var afkInsults              = ["sugar", "sweetheart", "love", "brownie", "hipster", "limp noodle", "princess", "turd burgler", "doggyknobber"];
var blackJackPlayer         = [Date.now(), ""];// format: array[timestamp, userid];
var blackJackPlayers        = [];

var totalSongTime           = 0;
var totalSongs              = 0;
var defaultSongLength       = 4;// measured in minutes
var MaxAFKMinutes           = (typeof MaxAFKMinutes === "undefined")           ? 45     : MaxAFKMinutes;// afk DJ max (set this var in minutes; default=30)
var AFKFirstWarningMinutes  = (typeof AFKFirstWarningMinutes === "undefined")  ? 10     : AFKFirstWarningMinutes;
var AFKSecondWarningMinutes = (typeof AFKSecondWarningMinutes === "undefined") ? 5      : AFKSecondWarningMinutes;
var blackJackTimeLimit      = 5 * 60 * 1000;// 5 minute time limit per blackjack player

var lastMeetupMessageTime   = (typeof lastMeetupMessageTime === "undefined")    ? 0     : lastMeetupMessageTime;
//var lastDJAdvanceTime       = (typeof lastDJAdvanceTime === "undefined")        ? 0     : lastDJAdvanceTime;
var lastCronHourly          = (typeof lastCronHourly === "undefined")           ? 0     : lastCronHourly;
var lastCronFiveMinutes     = (typeof lastCronFiveMinutes === "undefined")      ? 0     : lastCronFiveMinutes;

var lotteryEntries          = (typeof lotteryEntries === "undefined")           ? []    : lotteryEntries;
var lotteryUpdated          = (typeof lotteryUpdated === "undefined")           ? true  : lotteryUpdated;

var checkAFKEnabled         = false; //(typeof checkAFKEnabled === "undefined")          ? !!(curdate.getDay() == 3 || curdate.getDay() == 6) : checkAFKEnabled;// enabled by default on meetup days
var checkAFKFirstStrike     = (typeof checkAFKFirstStrike === "undefined")      ? []    : checkAFKFirstStrike;
var checkAFKSecondStrike    = (typeof checkAFKSecondStrike === "undefined")     ? []    : checkAFKSecondStrike;
var checkAFKThirdStrike     = (typeof checkAFKThirdStrike === "undefined")      ? []    : checkAFKThirdStrike;

var lastJoined              = "";// userID of last joined user
var lastSkipped             = "";// userID of last private track auto-skipped user
var lastLotto               = "";// msgID of the last chatted lotto entry
var lastBlackJack           = "";// msgID of the last chatted lotto entry
var scClientId              = "ff550ffd042d54afc90a43b7151130a1";// API credentials
var botID                   = "3941089";

API.on(API.WAIT_LIST_UPDATE, onWaitListUpdate);
API.on(API.DJ_ADVANCE, onDJAdvance);
API.on(API.CHAT, onChat);
API.on(API.USER_JOIN, onJoin);
API.on(API.USER_LEAVE, onLeave);

log.info = 3;
log.visible = 2;

var sa = true;
window.setInterval(function(){
var time = API.getTimeRemaining();
if (time < 20 && sa == true) {
if (!API.getDJ().username) {
online = API.getAudience().length;
} else {
online = API.getAudience().length + 1;
}
var song = "/me :musical_note: Recent Song: "+$("#now-playing-media").find(".bar-value").text();
API.sendChat(song);
var vote = "/me Woot:+1:: "+API.getScore().positive+" Grab:star:: "+API.getScore().grabs+" Meh:-1:: "+API.getScore().negative;
API.sendChat(vote);

sa = false;
}
if (time > 23) {
sa = true;
}
var protect = false;
API.on(API.CHAT, function(data){
if(data.message === "!com"){
if (protect === "false") {
API.moderateDeleteChat(data.cid);
API.sendChat("@"+data.un);
protect = true;
}
}
});
API.off(API.CHAT, function(data){
protect = false;
});
}, 5000);

function log(message, level) {
    level = (typeof level === "undefined") ? log.info : level;

    if(level < log.info) {
        console.log("Chatting: ");
        chat(message);
    }

    console.log(message);
}


function stop(update) {
    clearInterval(window.edmpBot);
    log("Shutting down the bot. Bye!", log.info);
    API.off();

    if(!update) {
        setTimeout(function(){log("p.s. architektas is fat", log.visible);}, 15000);
    }
}


function meetupReminder() {
    if((meetupUrl.length > 1) && ((Date.now() - lastMeetupMessageTime) > 600000)) {
        chat("Make sure to check the Tsun website at " + meetupUrl + "!");
        lastMeetupMessageTime = Date.now();
    }
}

 function onJoin(user) {
var JoinMsg = ["@user has joined!", "welcome, @user!", "Hey there, @user!", "Glad you came by, @user"];
r = Math.floor(Math.random() * JoinMsg.length);
API.sendChat(JoinMsg[r].replace("user", user.username));
};

 function onLeave(user) {
var LeaveMsg = ["@user has left :(", "Good bye, @user!", "Bye, @user!", "It was nice to meet you, @user"];
r = Math.floor(Math.random() * LeaveMsg.length);
API.sendChat(LeaveMsg[r].replace("user", user.username));
};

function dispatch(message, author) {
    while(true) {
        if(message.indexOf("<a") == -1) {
            break;
        }

        var start = message.indexOf("<a");
        var end = message.indexOf("a>");
        var link = $(message.substr(start, end)).attr("href");

        message = message.split(message.substr(start, end));
        message = message[0] + link + message[1];
    }
    message = message.replace(/&nbsp;/g, '');

    if(message.match(/(^!)(!?)/)) {
        message = message.substr(message.indexOf("!"));

        try {
            var args = message.split(" ");
            return commandDispatch(args , author);
        } catch(exp) {
            log("Error: " + exp.stack, log.info);
            return false;
        }
    } else {
        return false;
    }
}


function commandDispatch(args, author) {
    args[0] = args[0].substring(1);
    log(author + " has dispatched: \'" + args[0] + "\'" + " with args: " + args, log.info);
    return execCommand(author, args);
}


function isPlaying(username) {
    return typeof API.getDJ() !== "undefined" && API.getDJ().username == username.trim();
}


function chat(text) {
    $("#chat-input-field").val("/em " + text);
    var e = $.Event('keydown');
    e.which = 13;
    $('#chat-input-field').trigger(e);
}


function getPermLevel(username) {
    return API.getUser(getId(username)).role;
}


function getId(username) {
    var users = API.getUsers();

    for(var i = 0; i < users.length; i++) {
        if(users[i].username == username.trim()) {
            return users[i].id;
        }
    }

    return null;
}


function getUsername(userID) {
    var users = API.getUsers();

    for(var i = 0; i < users.length; i++) {
        if(users[i].id == userID) {
            return users[i].username;
        }
    }

    return false;
}


function getETA(username) {// use the countdown at the top of the page if you're the next up to play, otherwise do average song length calculations
    return (getPosition(username) == 0) ? Math.round(API.getTimeRemaining() / 60) : Math.round((getPosition(username) + 1) * getAverageTime());// round to prevent unforeseeable errors
}


function getPosition(username) {
    return API.getWaitListPosition(getId(username));
}


function privateSkip(user) {
    API.moderateForceSkip();

    var processor = setInterval(function () {
        if (user != API.getDJ().username) {
            clearInterval(processor);
            API.moderateMoveDJ(getId(user), 1);
        }
    }, 10);
}


function getAverageTime() {
    var averageTime = Math.floor(totalSongTime / totalSongs / 60);
    return (isNaN(averageTime)) ? defaultSongLength : averageTime;
}


function loadXMLDoc(filename) {//From http://www.w3schools.com/dom/dom_loadxmldoc.asp
    var xHttp;
    if (window.XMLHttpRequest) {
        xHttp = new XMLHttpRequest();
    } else {// code for IE5 and IE6
        xHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xHttp.open("GET", filename, false);
    xHttp.send();
    return xHttp.responseXML;
}


function getSourceUrl(media, callBack) {
    if(isSc(media.format)) {
        getScUrl(media.cid, callBack);
    } else {
        getYtUrl(media.cid, callBack);
    }
}


function getScUrl(soundId, callBack) {
    $.getJSON("https://api.soundcloud.com/tracks/" + soundId + ".json?client_id=" + scClientId,
        function(e){
            callBack(e.permalink_url);
        });
}


function getYtUrl(videoId, callBack) {
    callBack($(loadXMLDoc("https://gdata.youtube.com/feeds/api/videos/" + videoId).getElementsByTagName("player")).attr("url"));
}


function isSc(format) {
    return (format == 2 || format == "2");
}


function getSourceLength(media, callBack) {
    if(isSc(media.format)) {
        getScLengthSeconds(media.cid, callBack);
    } else {
        getYtVidSeconds(media.cid, callBack);
    }
}


function getScLengthSeconds(soundId, callBack) {
    $.getJSON("https://api.soundcloud.com/tracks/" + soundId + ".json?client_id=" + scClientId,
        function(e){
            callBack(e.duration / 1000);
        }).fail(function() {
            callBack(0);
        });
}


function getYtVidSeconds(videoId, callBack) {
    callBack($(loadXMLDoc("https://gdata.youtube.com/feeds/api/videos/" + videoId).getElementsByTagName("duration")).attr("seconds"));
}


function analyzeSongHistory() {
    var history = API.getHistory();

    for (var i = 0; i < history.length; i++) {
        try {
            getSourceLength(history[i].media, function(seconds){
                var Sseconds = (isNaN(parseFloat(seconds))) ? (defaultSongLength * 60) : parseFloat(seconds);// failsafe
                Sseconds = (Sseconds > (60 * 10)) ? (60 * 10) : Sseconds;// 10 minute max length to not throw off !eta
                totalSongs++;

                totalSongTime += Sseconds;
            });
        } catch(err) {
            console.error(err);
            log("Getting song length failed. history[" + i + "].media.id=" + history[i].media.id, log.info);
        }
    }
}


function checkChatSpam(data) {
    var lastChat = getLastChat(getId(data.username));

    if(data.message == trackAFKs[lastChat[3]] && ((Date.now() - lastChat[0]) <= 5000) && getPermLevel(data.from) < API.ROLE.BOUNCER || data.fromID == botID) {// repeated messages in 5 or less seconds from a pleb = spam!
        API.moderateDeleteChat(data.chatID);
    }
}


function rollTheDice(author) {
    if((API.getWaitList().length - (getPosition(author) + 1)) < 3 ) {// Must not be [3rd last - last]
        log("Wait a few songs @" + author + ", or get help with !addiction", log.visible);
        return;
    } else if(getPosition(author) == 0) {
       log("@" + author + ", you're already the next DJ, get help with !addiction", log.visible);
        return;
    } else if(getPosition(author) == -1) {
        return;
    }

    var x = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
    var y = Math.floor(Math.random() * ((6 - 1) + 1) + 1);
    var dicetotal = x + y;

    if (dicetotal == 7 || x == y || getId(author) == 3717069) {
        if ((getPosition(author) + 1 - 3) > 1) {
            API.moderateMoveDJ(getId(author), getPosition(author) + 1 - 3);
        } else {
            API.moderateMoveDJ(getId(author), 1);
        }

        log ("@" + author + ", you rolled a " + x + " and a " + y + ", congratulations! You've earned a 3 slot bump closer to the front!", log.visible);
    } else {
        log ("@" + author + ", you rolled a " + x + " and a " + y + ", you need doubles or 7 to advance.", log.visible);
        API.moderateMoveDJ(getId(author), getPosition(author) + 1 + 2);
    }
}

function eightball(author, args) {
    var outcomes = [
        "It is certain",
        "You need to spend $99 on a 9ball upgrade to answer that",
        "Without a doubt",
        "Yes definitely",
        "You may rely on it",
        "Why don't you hire a therapist instead",
        "Most likely",
        "Yes",
        "Alien signs point to yes",
        "Reply hazy try again",
        "Cannot predict now, forgot how to psyche",
        "Don't count on it",
        "Eurgh, lemme sleep, hungover as balls",
        "My sources say no",
        "Dude, I'm way too stoned of an 8ball to answer that",
        "Not a f*cking chance",
        "Who do you think I am, Ms Cleo?",
        "Does Invincibear do it in the park?",
        "I'm not sure, @Ptero's mom knows best",
        "Of all the questions you could've asked, you chose THAT one?!?!",
        "I could answer that but more importantly since your doctor is too much of a pussy to tell you this... you have AIDS."
    ];

    if(args.length < 2) {
        log("@" + author + ", you never asked a question!? Usage: !8ball Is Puntukas real?", log.visible);
    } else {
        log("@" + author + ", " + outcomes[Math.round(Math.random() * (outcomes.length - 1))], log.visible);
    }
}



function checkSpecialEvent() {
    if (SpecialEventLockdown) {
        var dj = API.getDJ();
//        API.moderateLockWaitList(true, (typeof dj !== "undefined"));
    }
}


//
// Hourly shit and general bot stuffs
//
function init() {
    window.edmpBot = window.setInterval(function(){
        meetupReminder();
    }, 10);

    analyzeSongHistory();
    cronHourly(); // hourly checks, can't depend on chatter
    cronFiveMinutes(); // 5-minute checks
//    cronSpecialEvent(); // 1.5 minute checks

    log("[Tsun-LT | Chill music Bot] is now Running!", log.visible);
}

try {
    init();
} catch(exp) {
    log("Error while initializing bot: " + exp.stack);
}
