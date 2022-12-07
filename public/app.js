function togglePopup() {
    document.getElementById("popup").classList.toggle("active");
};

window.addEventListener('load', function () {

    let Midjourney = document.getElementById('Midjourney');
    let Disco = document.getElementById('Disco');
    let Stable = document.getElementById('Stable');
    Midjourney.addEventListener('click', function () {
        window.open("https://midjourney.gitbook.io/docs/");
    });
    Disco.addEventListener('click', function () {
        window.open("https://disco-diffusion.ritsdev.top/");
    });
    Stable.addEventListener('click', function () {
        window.open("https://stabilityai-stable-diffusion.hf.space/");
    });



    let selectImage = document.querySelector('.select-image');
    let inputFile = document.querySelector('#file');
    let imgArea = document.querySelector('.img-area');
    let upload = document.querySelector('.upload-image');
    let newCp = document.querySelector('.popup-content');
    upload.disabled = true;

    selectImage.addEventListener('click', function () {
        inputFile.click();
    })

    inputFile.addEventListener('change', function () {
        let image = this.files[0]
        if (image.size < 2000000) {
            let reader = new FileReader();
            upload.disabled = false;
            reader.onload = () => {
                let allImg = imgArea.querySelectorAll('img');
                allImg.forEach(item => item.remove());
                let imgUrl = reader.result;
                let img = document.createElement('img');
                img.src = imgUrl;
                imgArea.appendChild(img);
                imgArea.classList.add('active');
                imgArea.dataset.img = image.name;
            };
            reader.readAsDataURL(image);



        } else {
            alert("Image size more than 2MB");
        }
    })

    upload.addEventListener('click', function () {
        document.querySelector('h2').remove();
        upload.disabled = true;
        document.getElementById("popup").classList.toggle("active");
        //console.log("2")
        imgArea.querySelectorAll('img').forEach(item => item.remove());
        let word = ['You', 'Developers', 'Source Artists', 'AI', 'Software Companies'];
        let copyright = word[Math.floor(Math.random() * word.length)];
        //alert('Copyright' + copyright);
        let cp = document.createElement('h2');
        cp.innerHTML = "Copyright " + "Ⓒ " + copyright;
        newCp.appendChild(cp);
        //console.log(cp);
    });
})

