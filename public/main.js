window.addEventListener('load', async function () {

    const lumenRequestScheme = 'https://lumendatabase.org/notices/search?utf8=%E2%9C%93&term=XD&term-require-all=true&sort_by=';
    const googleRequestScheme = 'https://www.google.pl/search?q=XD+-youtube&tbm=vid&num=30';

    async function getAttributesFromSelectors(url, selector, attribute) {
        return await fetch('/getAttributesFromSelectors', {
            method: 'POST', body: JSON.stringify({
                'url': url,
                'selector': selector,
                'attribute': attribute
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(function (response) { return response.json(); });
    }

    const videoSources = new Array();

    document.getElementById('go').addEventListener('click', async function () {
        document.getElementById('title').blur();
        let go = document.getElementById('go');
        go.blur();
        go.disabled = true;
        go.classList.remove('ripple');
        go.children[0].textContent = 'autorenew';
        let animation = go.children[0].animate([

            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
                duration: 1000,
                iterations: Infinity
            });
        const title = document.getElementById('title').value;

        showSnackbar('<i class="material-icons">cloud_upload</i>');
        
        let arr = await getAttributesFromSelectors(googleRequestScheme.replace('XD', title.replace(/\s/, '+')), 'div.r > a:not(.fl)', 'href');
        console.log('google');
        console.log(arr);
        showSnackbar('<i class="material-icons">cloud_download</i> Google videos: ' + arr.length);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].indexOf('youtube') != -1) continue;
            console.log(arr[i]);
            let res = await getAttributesFromSelectors(arr[i], 'video, source', 'src');
            console.log(res);
            showSnackbar('<i class="material-icons">cloud_upload</i> ' + ' (' + truncate(arr[i]) + ')');
            for (let possiblySource of res) {
                if (possiblySource.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi)) {
                    videoSources.push(possiblySource);
                    showSnackbar('<i class="material-icons">done</i>');
                }
                else
                    showSnackbar('<i class="material-icons">close</i>');
            }
        }

        arr = await getAttributesFromSelectors(lumenRequestScheme.replace('XD', title.replace(/\s/, '+')), 'li.excerpt', 'textContent');
        console.log('lumen');
        console.log(arr);
        showSnackbar('<i class="material-icons">cloud_download</i> Lumen database: ' + arr.length);
        for (let i = 0; i < arr.length; i++) {
            console.log(arr[i]);
            let res = await getAttributesFromSelectors(arr[i], 'video, source', 'src');
            console.log(res);
            showSnackbar('<i class="material-icons">cloud_upload</i> ' + ' (' + truncate(arr[i]) + ')');
            for (let possiblySource of res) {
                if (possiblySource.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi)) {
                    videoSources.push(possiblySource);
                    showSnackbar('<i class="material-icons">done</i>');
                }
                else
                    showSnackbar('<i class="material-icons">close</i>');
            }
        }
        showSnackbar('<i class="material-icons">done_all</i>');
        go.disabled = true;
        go.classList.add('ripple');
        go.children[0].textContent = 'search';
        animation.cancel();
    });

    document.getElementById("title").addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("go").click();
        }
    });

    document.getElementsByTagName('video')[0].addEventListener('error', function(event) {
        //event.preventDefault();
        //showSnackbar('<i class="material-icons">error</i>');
        console.log(event); 
        videoSources.shift();
        document.querySelector('.searchbox').classList.remove('up');
        document.querySelector('.videobox').classList.remove('up');
        document.querySelector('video').removeAttribute('src');
    });

    setInterval(function () {
        if (videoSources.length && !document.querySelector('video').hasAttribute('src')) {
            document.querySelector('.searchbox').classList.add('up');
            document.querySelector('.videobox').classList.add('up');
            document.querySelector('video').setAttribute('src', videoSources[0]);
        }
    }, 500);

    document.getElementById('close').addEventListener('click', async function () {
        videoSources.shift();
        document.querySelector('.searchbox').classList.remove('up');
        document.querySelector('.videobox').classList.remove('up');
        document.querySelector('video').removeAttribute('src');
    });

    const snackbarHolder = document.getElementById('snackbar-holder');
    function showSnackbar(message) {
        var snackbar = document.createElement("div");
        snackbar.classList.add('snackbar');
        snackbar.innerHTML = message;
        snackbarHolder.appendChild(snackbar);
        snackbar.classList.add('show');
        setTimeout(function () { snackbar.classList.remove('show'); snackbarHolder.removeChild(snackbar); }, 3000);
    }


    //background:
    let width = 2, height = 2;
    let buffer = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let pos = (y * width + x) * 4;
            buffer[pos] = Math.round((Math.random() * 255));
            buffer[pos + 1] = Math.round((Math.random() * 255));
            buffer[pos + 2] = Math.round((Math.random() * 255));
            buffer[pos + 3] = 255;
        }

    }
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    let idata = ctx.createImageData(width, height);
    idata.data.set(buffer);
    ctx.putImageData(idata, 0, 0);

    document.body.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';

    function truncate(str) {
        return str.length > 30 ? str.slice(0, 30) + "…" : str;
    }
});