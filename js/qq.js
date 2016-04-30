function htmlDecode(value){ 
  return $('<div/>').html(value).text(); 
}

function qq_show_playlist(url, hm) {
    var target_url = 'http://i.y.qq.com/s.plcloud/fcgi-bin/fcg_get_diss_by_tag' + 
        '.fcg?categoryId=10000000&sortId=1&sin=0&ein=49&' + 
        'format=jsonp&g_tk=5381&loginUin=0&hostUin=0&' + 
        'format=jsonp&inCharset=GB2312&outCharset=utf-8' + 
        '&notice=0&platform=yqq&jsonpCallback=' + 
        'MusicJsonCallback&needNewCode=0';

    return {
        success: function(fn) {
            var result = [];
            hm({
                url:target_url,
                method: 'GET',
                transformResponse: undefined
            }).success(function(data) {
                data = data.slice('MusicJsonCallback('.length, -')'.length);
                data = JSON.parse(data);

                var playlists = [];
                $.each(data.data.list, function(index, item){
                    var d = {
                        'cover_img_url': item.imgurl,
                        'title': htmlDecode(item.dissname),
                        'list_id':'qqplaylist_' + item.dissid
                    };
                    playlists.push(d);
                });

                return fn({"result":playlists});
            });
        }
    };
}

function qq_get_image_url(qqimgid, img_type) {
    var category = '';
    if(img_type == 'artist') {
        category = 'mid_singer_300'
    }
    if(img_type == 'album') {
        category = 'mid_album_300';
    }
    var s = [category, qqimgid[qqimgid.length - 2], qqimgid[qqimgid.length - 1], qqimgid].join('/');
    var url = 'http://imgcache.qq.com/music/photo/' + s + '.jpg';
    return url;
}

function qq_convert_song(song) {
    d = {
        'id': 'qqtrack_' + song.songmid,
        'title': song.songname,
        'artist': song.singer[0].name,
        'artist_id': 'qqartist_' + song.singer[0].mid,
        'album': song.albumname,
        'album_id': 'qqalbum_' + song.albummid,
        'img_url': qq_get_image_url(song.albummid, 'album'),
        'source': 'qq',
        'source_url': 'http://y.qq.com/#type=song&mid=' +
        song.songmid + '&tpl=yqq_song_detail',
        'url': 'qqtrack_' + song.songmid
    }
    return d
}

function qq_get_playlist(url, hm) {
    var list_id = getParameterByName('list_id', url).split('_').pop();

    return {
        success: function(fn) {
            var target_url = 'http://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_' + 
                'byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&jsonpCallback=' + 
                'jsonCallback&nosign=1&disstid=' + list_id +'&g_tk=5381&loginUin=0&hostUin=0' + 
                '&format=jsonp&inCharset=GB2312&outCharset=utf-8&notice=0' + 
                '&platform=yqq&jsonpCallback=jsonCallback&needNewCode=0';
            hm({
                url:target_url,
                method: 'GET',
                transformResponse: undefined
            })
            .success(function(data) {
                data = data.slice('jsonCallback('.length, -')'.length);
                data = JSON.parse(data);

                var info = {
                    'cover_img_url': data.cdlist[0].logo,
                    'title': data.cdlist[0].dissname,
                    'id': 'qqplaylist_' + list_id
                };

                var tracks = [];
                $.each(data.cdlist[0].songlist, function(index, item){
                    var track = qq_convert_song(item);
                    tracks.push(track);
                });
                return fn({"tracks":tracks, "info":info});
            });
        }
    };
}

function qq_album(url, hm) {
    var album_id = getParameterByName('album_id', url).split('_').pop();

    return {
        success: function(fn) {
            var target_url = 'http://i.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg' + 
                '?platform=h5page&albummid=' + album_id + '&g_tk=938407465' + 
                '&uin=0&format=jsonp&inCharset=utf-8&outCharset=utf-8' + 
                '&notice=0&platform=h5&needNewCode=1&_=1459961045571' + 
                '&jsonpCallback=asonglist1459961045566';
            hm({
                url: target_url,
                method: 'GET',
                transformResponse: undefined
            })
            .success(function(data) {
                data = data.slice(' asonglist1459961045566('.length, -')'.length);
                data = JSON.parse(data);

                var info = {
                    'cover_img_url': qq_get_image_url(album_id, 'album'),
                    'title': data.data.name,
                    'id': 'qqalbum_' + album_id
                };

                var tracks = [];
                $.each(data.data.list, function(index, item){
                    var track = qq_convert_song(item);
                    tracks.push(track);
                });
                return fn({"tracks":tracks, "info":info});
            });
        }
    };
}

function qq_artist(url, hm) {
    var artist_id = getParameterByName('artist_id', url).split('_').pop();

    return {
        success: function(fn) {
            var target_url = 'http://i.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg' + 
                '?platform=h5page&order=listen&begin=0&num=50&singermid=' + artist_id +
                '&g_tk=938407465&uin=0&format=jsonp&' + 
                'inCharset=utf-8&outCharset=utf-8&notice=0&platform=' + 
                'h5&needNewCode=1&from=h5&_=1459960621777&' + 
                'jsonpCallback=ssonglist1459960621772';
            hm({
                url: target_url,
                method: 'GET',
                transformResponse: undefined
            })
            .success(function(data) {
                data = data.slice(' ssonglist1459960621772('.length, -')'.length);
                data = JSON.parse(data);

                var info = {
                    'cover_img_url': qq_get_image_url(artist_id, 'artist'),
                    'title': data.data.singer_name,
                    'id': 'qqartist_' + artist_id
                };

                var tracks = [];
                $.each(data.data.list, function(index, item){
                    var track = qq_convert_song(item.musicData);
                    tracks.push(track);
                });
                return fn({"tracks":tracks, "info":info});
            });
        }
    };
}

function qq_search(url, hm, se) {
    return {
        success: function(fn) {
            var keyword = getParameterByName('keywords', url);
            var target_url = 'http://i.y.qq.com/s.music/fcgi-bin/search_for_qq_cp?' + 
            'g_tk=938407465&uin=0&format=jsonp&inCharset=utf-8' + 
            '&outCharset=utf-8&notice=0&platform=h5&needNewCode=1' + 
            '&w=' + keyword + '&zhidaqu=1&catZhida=1' + 
            '&t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=1' + 
            '&remoteplace=txt.mqq.all&_=1459991037831&jsonpCallback=jsonp4';
            hm({
                url:target_url,
                method: 'GET',
                transformResponse: undefined
            })
            .success(function(data) {
                data = data.slice('jsonp4('.length, -')'.length);
                data = JSON.parse(data);
                var tracks = [];
                $.each(data.data.song.list, function(index, item){
                    var track = qq_convert_song(item);
                    tracks.push(track);
                });
                return fn({"result":tracks});
            });
        }
    };
}

function qq_bootstrap_track(sound, track, callback, hm, se) {
    var target_url ='http://base.music.qq.com/fcgi-bin/fcg_musicexpress.fcg?' + 
        'json=3&guid=780782017&g_tk=938407465&loginUin=0&hostUin=0&' + 
        'format=jsonp&inCharset=GB2312&outCharset=GB2312&notice=0&' + 
        'platform=yqq&jsonpCallback=jsonCallback&needNewCode=0';

    hm({
        url:target_url,
        method: 'GET',
        transformResponse: undefined
    })
    .success(function(data) {
        data = data.slice('jsonCallback('.length, -');'.length);
        data = JSON.parse(data);
        var token = data.key;
        var url = 'http://cc.stream.qqmusic.qq.com/C200' +  sound.url.slice('qqtrack_'.length)  + '.m4a?vkey=' +
            token + '&fromtag=0&guid=780782017';
        sound.url = url;
        callback();
    });
}