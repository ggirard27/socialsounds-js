var contentProviderList = ['soundcloud', 'vimeo', 'youtube'];

var contentList = ['https://www.youtube.com/watch?v=gAeWAwdZf9I', 'https://www.youtube.com/watch?v=6CnP8ghhZPQ', 'https://www.youtube.com/watch?v=P_SlAzsXa7E'];

function playContent(contentUrl) {
    
    var contentProvider = getDomainName(contentUrl);
    
    if (contentProviderList.indexOf(contentProvider) > -1) {
        
        showPlayer(contentProvider);
        switch (contentProvider) {
            case 'soundcloud':
                playSoundCloudContent(contentUrl);
                break;
            case 'vimeo':
                playVimeoContent(contentUrl);
                break;
            case 'youtube':
                playYoutubeContent(contentUrl);
                break;
            default :
                console.log("Oops, something went wrong while trying to launch: " + contentProvider);
                break;
        };
    } 
    else {
        console.log("Invalid content provider passed to player: " + contentProvider);
    };
};

function getNextContent() {
    playContent(contentList.pop());
};


function showPlayer(contentProvider) {
    if (contentProviderList.indexOf(contentProvider) > -1) {
        for (var index = 0; index < contentProviderList.length; index++) {
            if (contentProviderList[index] == contentProvider) {
                $(document.getElementById(contentProviderList[index] + 'Player')).show();
            } 
            else {
                $(document.getElementById(contentProviderList[index] + 'Player')).hide();
            };
        };
    }
    else {
        console.log("Invalid content provider passed to showPlayer: " + contentProvider);
    }
};


function hidePlayer(){
    for (var index = 0; index < contentProviderList.length; index++) {
        $(document.getElementById(contentProviderList[index] + 'Player')).hide();
    };
};

// It extracts the domain name from the url, trust me it works, as long as it IS a valid url. - GG
function getDomainName(url) {
    var domainName = url.split('.')[1];
    return domainName;
};
