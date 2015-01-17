/**
 * Created with JetBrains WebStorm.
 * User: Marko
 * Date: 3/9/14
 * Time: 10:34 PM
 */
var scripts = [
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/commands.js",
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/cron.js",
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/lottery.js",
    "hhttps://rawgit.com/Puntukas/Tsun-bot/edit/master/blackjack.js",
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/afkcheck.js",
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/handlers.js",
    "https://rawgit.com/Puntukas/Tsun-bot/edit/master/bot.js"];


function updateBot() {
    setTimeout(function(){$.getScript("https://rawgit.com/Puntukas/Tsun-bot/edit/master/loader.js");}, 2000);
}


function load(script)
{
    if(typeof script === "undefined")
        script = 0;
    $.getScript(scripts[script++], function(){
        if(script < scripts.length)
        {
            load(script);
        }
    });
}

load();
