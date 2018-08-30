let process = false;
$(document).ready(function() {
    let login = $('.login-and-signup-btn');
    console.log(login.length);
    if(login.length > 0){
        console.error('Please login in!');
    }else{
        setInterval(function(){
            getItem();
        }, 200);
    }
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
    return new Promise(function(resolve, reject){
        let prices = $('.marketIndexItem--Price');
        $.ajax({
            type:'GET',
            url:'https://lolzteam.net/' + href,
            response:'text',
            success:function (data) {
                let info =  $(data).find('.marketItemView--mainInfoContainer')[0];
                let otherinfo = $(items[i]).find('.marketIndexItem--otherInfo')[0];
                let fbCounter = $(items[i]).find('.marketIndexItem--fbCounter')[0];
                let buy = $($(data).find('.marketItemPrice')[0]).html();
                buy = buy.replace('&amp;show_notice=1', '').replace('class="', 'target="_blank" class="');
                let labeled = $(info).find('.labeled');
                let link = $($(labeled[0]).find('a')[0]).attr('href');
                let origin = $(labeled[1]).text();
                let online =  $($(labeled[2]).find('.DateTime')[0]).text();
                let stats = $(items[i]).find('.marketIndexItem--Stats');
                let profile = link.split('/')[4];
                let time = Math.floor(Date.now() / 1000);
                $.ajax({
                    type:'GET',
                    url:'https://steamrep.com/util.php?op=getSteamBanInfo&id=' + profile + '&tm=' + time,
                    response:'json',
                    success:function (data) {
                        let communitybanned =  data.communitybanned;
                        let kt = '';
                        if(communitybanned == 'Banned'){
                            kt = '<div class="info kt">КТ</div>';
                        }
                        $(prices[i]).removeClass('marketIndexItem--Price').addClass('fl_l marketItemPrice').html(buy);
                        $(stats).append(kt + '<div class="info link" onclick="window.open(\'' + link + '\', \'_blank\')">АСС</div><div class="info origins">' + origin + '</div><div class="info online">' + online + '</div>');
                        $(items[i]).addClass('checked').removeClass('marketIndexItem');
                        $(otherinfo).append(fbCounter);
                        resolve(1);
                    },
                    error:function (jqXHR, exception){
                        console.error(jqXHR.statusText);
                        resolve(0);
                    }
                });
            },
            error:function (jqXHR, exception) {
                console.error(jqXHR.statusText);
                resolve(0);
            }
        });
    });
}