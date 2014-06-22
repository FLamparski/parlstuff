var request = require('request'),
    cheerio = require('cheerio');


var debate_fragments = [],
    date = "140605";

var BASEURL = 'http://www.publications.parliament.uk/pa/cm201415/cmhansrd/cm' + date + '/debtext/';

// TODO: get the date from command line args
//

var get_topics = function($){
    return $('h3', '#content-small')
        .filter(function(){
            return !$(this).attr('style');
        })
        .map(function(){ return $(this).text(); })
        .get();
};

var crawl = function(seed, visited, processOne){
    if(visited.indexOf(seed) > -1){
        return;
    }
    request(seed, function(error, response, body){
        if(!error && response.statusCode === 200){
            var $ = cheerio.load(body),
                $debate = $('#content-small')
                            .children()
                            .filter(function(){
                                return !($(this).hasClass('navLinks')
                                    || this.name === 'hr'
                                    || $(this).attr('name') === 'skipToContent');
                            }),
                next = $('div.navLeft > a', '#wrapper').last(),
                topics = get_topics($);
            console.log("Next page -> " + BASEURL + next.attr('href'));
            processOne(null, topics);
            console.log(visited);
            visited.push(seed);
            crawl(BASEURL + next.attr('href'), visited, processOne);
        } else {
            processOne(error, null);
        }
    });
};

var topics = [];

crawl(BASEURL + date + "-0001.htm", [], function(error, ltopics){
    if(!error){
        topics = topics.concat(ltopics);
        console.log(topics);
    } else {
        console.error(error);
    }
});
 
