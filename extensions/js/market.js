let process = false;
$(document).ready(function() {
    let login = $('.login-and-signup-btn');
    if(login.length > 0){
        console.error('Please login in!');
    }else{
        let cookie = document.cookie;
        setInterval(function(){
            cookie = document.cookie;
            if(cookie.indexOf("category_id%3D1") > -1){
                getItem();
            }
        }, 200);
    }

    $('.marketMainContainer').on("click", '.link', function(){
        $('.link').removeClass('clicked');
        $(this).addClass('clicked');
        let id = $(this).attr('id');
        let link = 'https://steamcommunity.com/profiles/' + id;
        window.open(link, '_blank');
    })

});

async function getItem(){
    if(process != true){
        process = true;
        let items = $('.marketIndexItem');
        if(items.length > 0){
            let array = [];
            for(let i = 0; i < items.length; i++){
                let link = $(items[i]).find('.marketIndexItem--Title')[0];
                let href = $(link).attr('href');
                array.push(CheckAcc(items, href, i));
            }
            await Promise.all(array).then(function(value){
                process = false;
            });
        }else{
            process = false;
        }
    }
};

function CheckAcc(items, href, i){
    return new Promise(async function(resolve, reject){
        let prices = $('.marketIndexItem--Price');
        try{
            let results = await GetRequest('https://lolzteam.net/' + href, 'text');
            let info =  $(results).find('.marketItemView--mainInfoContainer')[0];
            let otherinfo = $(items[i]).find('.marketIndexItem--otherInfo')[0];
            let fbCounter = $(items[i]).find('.marketIndexItem--fbCounter')[0];
            let buy = $($(results).find('.marketItemPrice')[0]).html();
            buy = buy.replace('&amp;show_notice=1', '').replace('class="', 'target="_blank" class="');
            let marketcounters = $(info).find('.marketItemView--counters')[0];
            let counter = $(marketcounters).find('.counter');
            let origin;
            let online;
            for(let j = 0; j < counter.length; j++){
                let muted = $($(counter[j]).find('.muted')[0]).text();
                if(muted == 'Происхождение аккаунта' || muted == 'Account origin'){
                    origin = $($(counter[j]).find('.label')[0]).text();
                }
                if(muted == 'Последняя активность' || muted == 'Last activity'){
                    online =  $($(counter[j]).find('.DateTime')[0]).text();
                }
            }
            let labeled = $(info).find('.contact')[0];
            let link = $($(labeled).find('a')[0]).attr('href');
            let stats = $(items[i]).find('.marketIndexItem--Stats');
            let profile = link.split('/')[4];
            let time = Math.floor(Date.now() / 1000);
            let steamrep = [];
            steamrep.push(
                GetRequest('https://steamrep.com/util.php?op=getSteamBanInfo&id=' + profile + '&tm=' + time, 'json'),
                GetRequest('https://steamrep.com/util.php?op=getSteamProfileInfo&id=' + profile + '&tm=' + time, 'json')
            );
            await Promise.all(steamrep).then(async value => {
                let getSteamBanInfo = value[0];
                let getSteamProfileInfo = value[1];
                let getSteamBadgesInfo;
                try {
                    getSteamBadgesInfo = await GetRequest('https://steamcommunity.com/profiles/' + profile + '/badges', 'text');
                } catch (error) {
                    getSteamBadgesInfo = '';
                }
                let communitybanned =  getSteamBanInfo.communitybanned;
                let steamlevel = getSteamProfileInfo.steamlevel;
                let kt = '';
                let level = '';
                let limit = '';
                if(communitybanned == 'Banned'){
                    kt = '<div class="info kt">КТ</div>';
                }
                if(steamlevel != 'false'){
                    level = '<div class="info lvl">' + steamlevel + '  ур.</div>';
                    if(getSteamBadgesInfo.indexOf('profile_xp_block_xp') > -1){
                        let block_xp = $(getSteamBadgesInfo).find('.profile_xp_block_xp')[0];
                        let xp = $(block_xp).text();
                        if(xp != 'XP 0' && communitybanned != 'Banned'){
                            limit = '<div class="info nolimit">NO LIMIT</div>';
                        }else{
                            limit = '<div class="info limit">LIMIT</div>';
                        }
                    }
                }
                $(prices[i]).removeClass('marketIndexItem--Price').addClass('fl_r marketItemPrice').html(buy);
                $(stats).append(kt + limit + '<div class="info link" id="' + profile +'">АСС</div>' + level + '<div class="info origins">' + origin + '</div><div class="info online">' + online + '</div>');
                $(items[i]).addClass('checked').removeClass('marketIndexItem');
                $(otherinfo).append(fbCounter);
                resolve(1);
            }, error => {
                resolve(error);
            });
        }catch(error){
            resolve(error);
        }
    });
}

function GetRequest(url, response){
    return new Promise(function(resolve, reject){
        $.ajax({
            type:'GET',
            url,
            response,
            success:function (data) {
                resolve(data);
            },
            error:function (jqXHR, exception){
                reject(jqXHR.statusText);
            }
        });
    });
}