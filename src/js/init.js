'use strict';

// expose API
window.fruskac = new fruskac.Api();

var util = new fruskac.Util();

fruskac.isCrossDomain = window.self !== window.top && document.referrer && !(new RegExp('//' + document.domain)).test(document.referrer);
fruskac.lang = util.getParameterByName('lang') || CONFIG_LANG;
fruskac.isMobile = document.getElementById('map_container').getBoundingClientRect().width < 1024;
fruskac.allowfullscreen = window.frameElement && window.frameElement.hasAttribute('allowFullScreen');
fruskac.allowBrand = !window.frameElement || !window.frameElement.hasAttribute('allowBrand') || !window.frameElement.getAttribute('allowBrand');

if (fruskac.isCrossDomain || fruskac.allowBrand) {
    // remove logo "hidden" class
    util.removeClass(document.getElementById('map_logo'), 'hidden');
}

var i18n = new fruskac.I18n(fruskac.lang);

var storage = new fruskac.Storage();

var mapConfig = {
    center: new google.maps.LatLng(45.167031, 19.69677),
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    }
};

var latLngZoom = util.getParameterByName(PARAMETER_COORDINATES);
if (latLngZoom) {
    var latLngZoomParts = util.getParameterPartsByName(PARAMETER_COORDINATES);
    if (latLngZoomParts && latLngZoomParts.length) {
        if (latLngZoomParts[0] && latLngZoomParts[1]) {
            mapConfig.center = new google.maps.LatLng(latLngZoomParts[0], latLngZoomParts[1]);
        }
        if (latLngZoomParts[2]) {
            mapConfig.zoom = parseFloat(latLngZoomParts[2]);
        }
    }
}

var gmap = new google.maps.Map(document.getElementById('map'), mapConfig);

var overlayImageBounds = {
    north: 45.166508,
    south: 45.136001,
    east: 19.767672,
    west: 19.681498
};
var overlayOptions = {
    opacity: 0.8,
    clickable: false
};
var groundOverlay = new google.maps.GroundOverlay(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAAJaCAMAAAAI8E4jAAAANlBMVEVHcExISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEghISFISEjDKoITAAAAEXRSTlMAn88w7xBggEC/3yBQj69w/h57SWgAACYbSURBVHhe7MAxAQAAAMIg+6c2xT5YCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4Oyd60LjuBKEdZdatmzq/V/2LDPL5ECIy5KVYXbo79fOAklsQqXVl2rvfc45lWL+cBRFUQQVP6nbYv5QFEVRlpIaAKSScpOAkMyfhqIoSkzZCn5Q0m5+koFm/igURVGKxStu+5C78uFpiqUoirKI5JxL8eaVWJI3lCJAsJ9+pw8oZhaKoig+/8NaSkk2lxVvBAcAPA3lBXAPv6nAmUkoiqLEgPekUnK2UoPIlhuAbV/MIxYLuGIe42AmoSiK4mBLKXv+h5KaA9KbkplXSq0AJJnPiDmgJiKHZg6Koij245mtePMBvzvAmntSRcjmiOhmZd0VRVESQjQc77DeiZEANjK9EjMFRVGUguBPfuN2L0aO/KyvkGhmoCiKEgOSOUcFEPx7vSJilAKsmYOiKEo6n2FqIoLgz+tV3IBkJqEoitKwdia8lrN6VSqqN7NQFEURxN6SYjynVw1o0UxDURQF1fSxwcUzerUirGYiiqIoENNHdKgtOtLOUMqXjxAqiqKCZaIAIMU/i99jK6MoigoWD7IsqQ6GnKP5chRFUcEyMT30G32F5LeejqIomnTn7AE/kGimoyiKIkhmFhah5X/YzRNQFEVZgSo5N5GKKjb/g4gEAGJ33/VIFsGb56EoilI2/CQIfuFEHACELcWOScNiZqAoypI2AeSz2pVSir8lzX+pjk+2AsjmDBmymnkoioYR4tB3alH8fs5vIQYsZgKKohQH1B8JmWghpgfFn1KshM1cR1GURQApz9yIoIrlA1ZzGUVR8vudLhWmD8VTj79Y0cxVFEVZHMJubiwQ048qlng2qnMVRVFSgCzvTZp204uSBMhHerWZqyiK0vBBn2II0fSjrAHOE0+/CyiKEre7JgYLhK2YIfRmprl6pSjK4VKXRUTC2GIEZQd2c0+eoFeKoqwPTAMKghlEc+8LWWs4hqIo+VFrkB3rGVK8gyNrDcdQFEWwPAq9rBlCcR8nBh2auY6iKALzgBDMEEoD4N/925kJKIpiUczsM6GSEOLdP66iKEpGMtPPhEq7VQXLLAcsRVE8tiecCZUNLpIZw24URalYnncm1P62NFGvFEVpKA/PhM1cQhUrZkzUK0VR8kPBiqjmCqpYNfyc1FGWYiahqGCRHq1hVLFgF9WqUnZBNU9GUcHKl5JYSswqV0XwSni6YZGiglWQzTiK4gVwOe/L8vReNEUFy0PMMIqSb3sC2rMrOIoKlqkoZhxFzcHW37fhTFHBSvNCLCWWNW8iW4rfp69jMb/Yn+0QrahgGYdkLqEsZc3ZisMvqv8merXF3xquKypYBTWaIZRY9iYVb4jkXBZjlvZX3lO+I2iFM1dRlHxYcLYj5WjF77bilSBbzqV82EmUzV+PvZcnB3MVRVmRyWx0H8pqK4AgOZVvO0Gw38LIadt5FYU3W6GaDhRvAxC23ROX178b/5mHPcRMR1HBGv/jUpIDgl070oZ/Jw67eZpgKSpY3OCPo6QKSDKEbyBY+2fatDxfsBQVrNLRoaxyZRdjVLBiwPKcd5KipGPBirOL0cuaX/nb2ifLL2sGFayM9qTJVEURZJKOmCctJW8B/xL83yX7b+tTVbBiCJGUo0dRFEsi9TYniRXX5gAgbLm80v6q8f3UZSy6wf/dAVbWbKjyzATpEQXWXCZaAHBtXW5CiPZN9coIzN9MwPKsuFJRChGsKZ1YFrWtkWRm/4uQxTjfsbctwT7vIKwoIcSnH2Aq7p8jw34Dvfp+0wPbA2GSGQdhRcnYyJlxN1cJIMXvb6BXpC77XBaLj4hIy2Ux49DBo/mTOYoSHfIvK5T8RiplmVeOFnjzl4ZYMfRehkX5Armq8gH8xHozlfQgN7nqVKoyL0RYc5OKO5zYbK9nx33FRkKsv8ZGhVPxBXKVzCeUNVdAiH7OkeMNq7mKovg1S315ebNCWUuJvvxDytmK4JXXr4q0vJY4XESziRxGv4Fefc2ISswBNZF5Im8Il+V4uVhpUJS4ZsEr4eWllfJA0Ep6CTe/TNlyKqaP8qjoH+t//lNX4AyB5ASfzBoQcrwwUzRJjjOyGUZRfHMAULdcIjmkQH7ITsn5Tbic3b05jTxMSnvU/7xNXTSEL20btQBQdz4GiRyfaq9Wh4//irLaAMC1NRLjj/uvLmVvAgDBFnMOOGJe8w306qvs++IeEHZDyQF1NaPw5bvrYIFFUZYWgGDXyJvZH8qZ37cAWHOGCPlLp+oywnKpivZ88tkZx2iBLT4t5y5Dv2hFSfJDrWgYz43XVocWDaegnXh7LyVbAYAgIi3nVIr5w0k9A9y+pCxBpLnfeCIsFWHv+ebVXEUwNeWuqGeTS5GE8SedIn0Att1fMdxy+HFs2d5yYyLi8EawKf7X9crvVuTmUAHc4tKYNgGCPPB+J5RS/OSgKTagXResmRP0ilrMle5ORoSHFfMKIGxpIZ6lh2ZbewAgW169ecOXkrINALZ9MX8mHlhZ/mgLv3S45VTij0v7/9Zz90ufnWRvzrDu2cqboi/H9cHaqYQlwC3PEKyAaBTlmsUcdw/g65mWn3+Ufsz9KaGlCuTlUSWzAnDNmz8Qh0S7ZVG33T/s5dz9bX+hAOfCofwmbzlvAQfB6wK0/oqAXPUpA8w9CVv5wUk1VJRoH6dfQ7jkhuIbhAzDPqAikBagZRcA1a7mz4I7sabw+MrSJ72cS6pwPEZGaOmXpOwHY0F27BTWENjPdXy6lZStCF5ecMOJ2JxXFS9l9HwAYYJFqChDP+7IqeYt1xOAsKV4ftQIP89gi3kaCY1aZHW6vMZAWkrXuw7PxaGZaZ3l/IVzBLfsncNPwkvd8g+siAS8IdF8gqLEDciRWfSNC1aBG/vx0rWbVPxJvbpl7oPIbk6z7FZ+4gCI5DUOtn9mhHWglBbJL3Fb7kWukABrQLHWS4J1s8KWthdv/F33hy8lZ+s+7WJTFF9RPWlOJmc6ghzEBiFMa82v8bzbSyl7tuIAlI4q2RvhrVxpy8hV2eNUEGr//iLv4Iq5Y0UlAdbM8ifHwjoAqDZ5Zr+zoRlF+Wz2OPLm5CvdncuBQztkYmN5vzvVevr5C8JbHtz8IJZWH9y7FZboVb+DX8Z+eF02ksEnEmCdJqHG0abk+vIC1/6/4hvQzq8DU5QFSEyQ+NfHXQAhZhYO9oRe0b/onleaKoInjUVEr3goxe9zCo/CL/+ZuiwI5gIW27BL4IvEj7UH4qasKF0LLDP2yw6ZsSI9X7Bixd7t/lnOno485EHdzBPP5/dYVM/8Grr7P8JBOTDP9kaID6oofB4xxRA+1KaTucH6sxTF04ahgky/TikI6xTBYoK0drsVb0h9O7B5TmeBXJiIbih9gpURPDmOz/VGKJDRMSCL9fbSHNHudifdivYzWHNdsDgJaPHZgmVWBE/0ivxFDxQfdjgSI/U5OAhil2C14zDFIk1aczE+rLxswLZ80DofWC/s8vHOKtoums1lwWpn5zr8swXLZLhI9IocmgaKDxsyscXhr4+bcmaUodx0QevJsJV/8HNDrCUDdb1pHUu333C4XZqikJD8nGBFyOlur0S6vK5jIZ16Zdq5l9AeRhVLCJFITs9mf0iPYK0BjonLyQxbaYKf1LbyXuBTpJw3IOTbk6C+OW8kc4MOmipKg4v9uZvxTqoUkMhBa7qLOtcrf/JIKIhnt69DDiZ2GAXbeTfDuNGZwB35XIYthn+nELMDgMPZgQQ5P6Ia9mhubG8TOMl03AtFIckbIlgjpr4+wJOD1mViQCJ6RcaUqS7TNgFI9/GZS7jg83N2oVnK5Wz1YHs/tF7L5RBrd8BHK8d0c95gNDSjKF3dgx4yvPmTV9Qayvy1ZIXoFUnskpMvT4PB8SMOz5VxwcpA65/9y0hnfNV9AzINsfhIfVuXSx+pitK34gEyHILxpklBfKp1Hm/QgnT2q/EQq2LpDUa5hFuUe7OXdWDvdEahuS5eQq78UryD8+YCm7Y1KKTF+7JgccViccP8UmHGRi7vajrFYj3TayvoyJWRXono4JYBvTL5tK+6d7DjbegraVugFFSjKDymHxcszoZ1coTFS4UhxEuCxfVhRSN3pEOwTo0YRgcbR/TqJlhcHWJ9dCW8+7Thanzk3t4qihID/PMFi588GtanLFxu9Ar4FztOYBGO1OH6BItn/QWhQ69oDmsNSCQh+IEdltytMusjVVEsmnm+YPGjR0EoZjpLQCKd3d2CtZQNYTnXYAUhxz0iWLyvYYfr0Cva+rYC9UHoWOPDj7x48NxdblZenPzE5p/spfzKkilK6bAIAaYKVoE8P7HqgYW8wN7O1QwA5dzCPVSSUCeCRX/Y0wA5vut6YyfkBGTSxn9HQz6I360xXfaL9/x6CEWpHScxmStYpiI+f1lqQyEvsLdzNcPmHM9ZLDgcfBdBwH181nD8quPuAKTzBg4VIZI2fuICSLp3H28pwTuD61j+Jee8GEVhZbPnC1bDOlOwuDQU5I62J/KN5CawxLnMiLA8iz4s4LJ/fGAO/u5EmB9fd+vtGN4g5gRrq2QMSFHYvOzzBWtFJu/6CRRk0mXQ+/wrbL9gDRi7CFjyL1pslzoud9TbXhqWwY8BK/lF9jtSmJg2kMWSikI+NOcLFq/PC8wzKLAkiCOnt047uYJ2NkoihEB+DzGAyB51oLD4yb8rtVYcx6CuK15MvH6ZtvOhlaL0mWUL4rBg8bpcgHkKECJYZIym0/c4QohgnU1iQYhgZQhTPV+ZJ1DJ2YrgDXdsMBrJS+1aUuFtAGrzRlH6DzccizJXsCqIYMwA7pRgFdjuUyYXPgF7unHB8uABzPkK2/JDujZi/EncYjtcX01yQOhQK0Wxfc2aebZgCeLzDUQqyAV0T243ZLbTmDv40WkTzwRLsHO92n/LB1wIpAPuIzFXQJJRlMEI5ysEq6GQxO0EhAgW+RpZyEzaOjPKaI4/Qg4lcYXj6+S9mQBXWUFfQ0O6201NUZSIWr5UsDIKaRaYgCBOFixUzy6Kx208iQU5SPrzjTVxm65XRuBPCpYcBMyLDMiVoiwCpC59WecKVkImCbIJNJSJgsVXN2QyDHTafiuEg5N8JAvcyTcMkpFYVMkbGtYAGVFSRUlA6dKXUcHiPyAwzyETweoWzBX5/F1AHd6rIHj8AjyTI76JZrypjTdp7KhxcmJNUUpxsANvV+4UNRCr1C8WLMFA6pnX/wTL6JlQ8HgUJsDyrW3zKbDkHtOGhoyQTD+KspCx0v4ICjLeIwX54wSL25jzu5CpJfNAzPfygsz9kJ9AATIXLA8U4jTbjaKsqNl8sWA54hw1gYyVCBaJ8Ho9NiEkJiFnQhJh+by9vKxfolemAFjNPRk7cbMZ1CtFGa/LechkwXIgYjh3xUZGIdrJ4YOACOf6rXa0gRxWA/AivJ3hKZQgEPZR5h5flyVmzopCGoa6oIJVTR8yR7D4+C8XrBDMpBCr4txdjqj9gpUQElm3/MQopmweWI4Fq2AbWc+vKLxsPlmwHIYFa39e3+huZuaw+AzmhnIut75h7RWshODJUsP8xFNXEQD7sWDt2KfplaJw+RmPoAT9Qd4T3bBu/eAT2xr4+PMKF0+do9fjqirCp3pFotH0BL3yZU9v+1q3/UH1kN7IrMsFlfklaq4v/ZZSRCWeKFgxoBDBIuW8/las5b3je0UczIXJZ+bspB8uAX6W1md5xQFAzaVEY6KAjhFVzFRSRRnPGm2oc9P4mQjWzBUb3K1hktgL9pPRWEYmgnWnV+QyLMJqOiC2eq9Uqbf/DHj0WtkIpO9RUkXhIQUnCXYSePxhgoXztvFwc47TCSEv5yZ5Inr2JEaHdnwZUaZEMX7/aKu3lDVnkQBQwSpoD0LdZEZQlHGJWFDzQjrX/yjBEqSzl+wwJZsXA4CwnDv4WaTzgiWwx5fh64SsdpaAx7Z6S3n0Wsnn4IZmFOXiUHA3FpCxrDwVrNU8AY+wnBOsiDDFLbpYaRvSXVcl2TfDBcvCxcPL2CfswyoVqAP+6gjHeUzuhaMoPIPezQqsEx9TUMhg9VUywnoqZ5RICNBTXijIJ1VJkE4KVkKIR+IeN4Q0wb5jW66ZjlWQ9eJDKIpg6IcyyYsNN46KuQbZpsdU0cGPnad5Lk9QyDJZLlg+wB+lCr2Du6gJMQOuXHwzRQjZZv/bUFSwVsjUVgnBs2cJN+RThVEPN7jtkFdLV2wkxqSCFSvSu1RhNO9IATaaS6SAsF9+MxU0Yvz321BUsDaW94IbfQ2AeQI73LlOjoY0rycko5zttypwxvBF8u8XEKJG+/4JL3tMFQe0eP3NlJHICfq3oahgCczU4RzU576nPYInMkN2DRLrLyZY/EQkSDz4Wt8b4glanmqGHAWQZYYPdcY+miCcj6KCFfl84vjOwIvQzS0FmZjynQbSUYCNIcTH0leJ7N37t7d3hlPL5fRVCSR5dX5kYUElc95DKIrgCa0QFaOOo/PLhLfNLVywLNYRJy+u67w8aZFpz8fddSC+O1XGq0bZbVpT34Z16M02H0UFKyGP90owV5L8NL3infgNzXTh0HNrF4R4UMdcSMnVQY7moi/2DDSENK0LuQg24q5KUZRJiVAPGSv38y6IBfJsvWpAJkPSc+Re0NPSnrGR5ojokA8OpDtNYVH7rFmC1YCw8tWzHEXh2sIJYTAE45YukwVrudMrg5r94xcu8+Re0NXSXrGSHpElYL37yhzNyQh+3psJdSUmisMoKljzw7KCNnKumi9YPsB2JcoFadrdQ+iaGiyokTzMirAc5OKYYhH7rImCJSRNN4ii7Mjzfyj2yE6EmyNYfM0VH832CHFYsLgyetRDExz2vzPcnWANK9a46QsxyinYSEfZPBT1w+IskHmdoyvakwRrB/beC7bIs8x5IH0RXLyzXL4/CArawZUMRkqxIs18MxXk0fkHReE9Bf1UsK8PGg2XeYaU0SKsTKG5aozLPYT0W30ko32u6CHeXh7WoydPI3miDXbqp99CduqMoyhwYx2C05ol3PtuokkrCsru4PzA303G/kTBMnLobVOpX1ZBWI6e3MINbKaMc8P1pwmWojiYaZ1YXNBYc06WA4+3Ek9qlXUAsMWRM7CHPEmwuB+FILG7uQK1HA0Gue5wqaKYyYLl/hzBUrQRi+cjMspYAj+XWB8qVqY+AjE1h1ekJT+YtBsULK58PMQqqLSLZNmAfPBKYyUhImkAmyFYDiTxORNFTd05kJFzFXegKsaUhyWrDGyReqFWmzzX2ucLVkHr9uaxSHzCcQ1IB6/Uk+5XkrSbIViCZULyQVGmFW8qhv6Q+bjGkuVIsODieMf2/MXVBbn7a5WEWPwjJQHtoH93RfB9+6tnUbAdBNgO5jKKgjrLWZl3jvJYTAC3P/YvJnrEFYsLluC5gpWwEbdo+v98/XER8vJg/JBk0YlLF4c5pyZkkoobRVEcfcdyN83xfEVA7EjxZGMRlmuKVfFlgsUlYsXGIqy3RFXML3eCRUuFPNPG4Z9TBY1VauajaBJrfPcgZPBAkrEeS4C9dirkVQaBf65gJVgS8PBDuw8A3E3ch0uFDWl+F3KE0NO/oownHrrx2KacMyv8eSUsyCR84IrFBTqjTBQsvjyGlysQzB1+C3BIxKOC4xDnC5aBTIvlFYV7L3DgZpyrEqTjMFmQSfhAFGtCSwaXFy5mO1xkOwp5TFgA5IOp79QxyDlbsCpIB8swimKxTu83FYz2LFaQWJB0GnHFgpvmjZNRRqKvDRu9sXw5z44Xay4qVkF7hmAJSCf/MIqywk4fztlQugMsnmKC3LbzjSuWw7RxcDsmWNGhUKnn52/74kyfYhEtnChYpM1sHEUJiLNT9Rmlu2eRPzDk7IjvUTXRosxqTKuIY/mtEAoTLF5XjC8v7aJiZZTnCFYkbWbDKErDPlzB5m0PnQZQBY3XHi2EP7iLJKpgz8JBGIzUdmBngsW9hfGCdKhY6xcJVsNKhiWHUZQFdY4lFi/2cYvNeGptu+OPv2EjIdTlVsoCGT1argE2EsGiD+UAeOIj+iWCtaKZZ4VYiiJYR2uL44mgWLF2NnbCvXO1o+sn2lDPRUK73I3Gb4F3cJG8OPZQgnzYR7sjxN8rWBspPsr1nJmiFMjkbaoFtts2jmfdA3qc/paAxF76tWJWRh4fAI/y6SXA9QiWb3CRnIt/p2AJae+asYhCUQRlyjZVngjizUgZ6UwFbecDcx7Bk5dOBI2QkIe1YBUAYT34VXDBaihmO7zTFtWP/xbH9781uNA+f8LN/H4UDbES8hXBKgj9hlUCEj0Qw2Dy0rv/issFwdrg2rqYO1a404WIjMKa2i2CH9bmcdehFUAliYDfiKJZLI+Njxjzmvu4YBl5oFh0CnjBNqc5qSBT2eOZMl5JWyCPT50xwA5vdEY1TxGsWB7NZJbrh0JFKahxqi2NgKSXdnNVsKKDMwQH2z+MVGCvWx3wTJk774kFObhVPhz6GiYgk8h6GhAi+3MOhYpikadm3QWe7I8fkAuB7xzxjQGp283LwE0wXnVgr4xOCXDBajd7rIeUx4IWESYLFgnBRzycFYVbCHAa1oHyExeaBUIelDwQT7xnpCkWBh7bsOpFOOJyzwUrQs7cB+9Q/bU50hEBD2HK2lZF4VW78aw71wRfj2WGCNYHmc30ZdbYO/LbkAZvAQ8UuSqW04JlIAeB5I1ogZ3Mkc4XrA2e1ELGUZQNbUKvO89E+QBrhgWrf2DOQkh0M7pdNlZ4vk+CR6j82QNIacOTtrT06FgYEKeO0RM5P13gVZS+dA8HMpK4TgHNjAtW/8BcdMi9Z76KaCjRHejagjBskgE5W8IQnA2QvUMoJJicZVTEHUZFE+8cpSvdwwlhQHYykIbLjzvywMDcElCIYcPIOPji4OKFIkZEnSBYy9l987EBLU6YI+U6zz8WooMs5hKKkvoUS9AtO1EQyrg3YEEeGZhbEZb75FNZLo2D+wAbD8LVEIfdiSvouNJ9yBkrErkNAZXv5OHwkzSP3qJDyNH0oijjuQVB7JSzEuAWwxAiWP2v+m7gLgKAvTKrlEBqDnm8zCo4O5eYUToC5LgBLc5qxeLHS3+UKszht0qWoorVUPo2F2agGTNdsIzcaQ/9jl3kMN28Qpg/YDKGBFijXg+Cs5m6jJ3UeWmQNe5RxTN/DuW4dBnyYi6hqGL5IUNzLmfeIazmomA1klbv6PzKyKOmWNGRaCYj95RZ+Q1YESJT8FsaiwdZfKqTw9d4rccJgMUGYEtmGEWxCH5SI9b64d+QePGoGSGDbsAxIHc5nSTIGh+nr1w0LMDihHBasFJFIYJ1sod8rWh3jg7RTGDH3ltiiXsFgk2jz68oDUi9o7/8wFMqwn59swOkw/uBaBrplKoAXCufahks9cnqUWYuWDsgkT+RD9j7ZxpigDxrhXgK7F75VgFI9oaiKLzHkBeF+PEtWmCLE46aENLPThSrpxRYmgOA7b4lgodzIfYlAXnSPZGDa8fiif2juiegzT0R3vCBB9a+OWCwl1RRvEMtHZ2j9Pi2B9TVmBmC5Ug/+wEeWDub0eNqK2AjSV8NBlgmdwhWOfcbSICjtzp9rBgI1zlOephgdJ6rXRKUYgMQZMu5FGOWkrNIBYAgm0ZgymGPIexiGHBnvloqkKO5JljcZcuh8S2IA02Ta0W46U8hAQMJsJ4uWGZ1gBR6J/BBLsYT73x00J4qtmQEIIhUvCOIBFcBoD7SVEUptoKHCQ78q4sA22J6yF1bRjvWUgjKyGLPfOsF2IHW4fQ+UbD20zFuEUByJOJSyJG6H9TDnWaMpYZ/C4ZLWXOTuuW1mFdkfZXU7ShzqCh7QKMCwL4aG1BL/47Wfel/xoJAhLHADa1EWDZAFmMi6b4iAdbp5Y0CUt8gh/IiLCOUkeiReqID7RquiE0qb5mKZhSFjOCRQ8BhsS8HhGR6yQBkoLk+w1GF3cdsC4sDciHZGBJgnY+wQiCCRY/IxcFFciPITtipHv++TsipxwptM1VIzifldbBzNL8MDl9YADLWXN+IBiMsg1un9gBS6ewIsIjxKYQIFhfweDizsIQQO+y7etWXDJESBr32FcUhWQA1x4F99MW9vNjFDLCUFW3oryJgXfKhiEIOlsCzSsTetauQg3q2A95DiICTDmAaWOZrhi/cdroBcFIXQxht/FMUD8CtFgg5dp0ClrVV4CVPP15krGR3WMDhtzjkjxq3mA5mBlgr7OkBJAjJRRHFohtHooON5gIBtJATMG6OzH/7irLKFo1ZLBCaP/WJt5S9SQCAbcc2/XixIpMfxIYQDxNzfiyymL/MY8N6+uQD6Y85LGo8vxowOu6kQdruGBuwT2qlVxQ2pVptKsehgN8rXqlbLqSvlB4vBg8Fst9JBvETryhmiKur2D0qH03igtXvvbFhe5RmInpCbF0ZseGKb5+HM6dQlJg2/MDJDffyItJyzvJKBYAtr4XN9nIcRjc78FOehZBNy78pwHJIxKXlqmCZDZmbg93IfT0od0ttOd7xjmTikn8SRSl7E8H/8/KCG1XsvpxrmhpvoYcYCjmLOmRS4p8cYHHh5DN5AM9h3VMQVmYre99w9lQftRS4ZHGXfEUZ3+pUCjnYzcuHcMHip7wlYCUiM8xGgwDu6ZJgzR0IfPj5niUD+W5zvScNZzY+0/cx5gDYMjt45SgKhKXOh9jRDiykOCscs3h/St49ZlRzikVQPRM9fqd3qt/lvfP8InRoMFWEHMf1ihNTBeoepwavHEWBPKUKvWHvnAbqc/1tH153xTpFrsLZ5sj9aIT60xQchPXB8t0+frWALGeuo6aufLuL3eVnABu763NP7oqCyjzLGSQzM3jM9KixI41VJnx4x/NLFcrhYHlCPfvRkAB7Sk9ERADgZBkwWqCmK3rFWXIFgj2tWQXVXENRNhTSmDx7jrahTMh3LAHLQcj1VLlKDpClNzqEPMhgn6vMAXBiczktJxtQ03W94p2kwXpDmNB9oih8t4yHjK9fIXmxa60NPmC5D7nGSfVs6SsBkGK6NyJCSMvWbLywPBPXK85qA1CbNyZt8ag+vZE8o6Jc/9yDTFhwx4d2OtPRy14BS/yTR+WKZ46bJ7HhTm4l0e9pFAtgS8sEveKaVfD5lSwlbw7AjIy7oiTYZwjWCnv1mOmwP26A3dK9WQHSZbni7MhjtTDU5/gX8DwTqt1LJHp1jSR4JUjL5SbnPmUJeEXaPkWXFSWEiYLFfzLmg8fke3SKDYDblwcJ7PJUuYplMYJlLPkm+Br/Ar/LbcKh5bx/0CuJZgYBIUvFD6q0nK3DK1XyuphZKIqAyM5EHVzSdrBgnnZ0L7ni4ETmKyDpWXK17A6vBKIPCJF4Jf5OwbqFOhLwE3vT393xX0Zf5FnWbN+eyd0Cuz8MRQWLGxn43QFwD/SGKlZMjnb+rALUNFmubk8u2TrI4HxhRvp6h6hYioONJeVNgKmbud49kC/Jm6koCi9TlfHKTnn/t7C2ittZjnE/5VssAMf3C5fttGTFfHYobr09uVlW0oAmZOr7qy3tVvyLk5yK+W+hKBnlKQaRG1wxPyhZ8KBcxdiwva1Dr+1kGY/0TPbK1dIqUDP7Tr5GIyB+fYS1V0C2vJfF/BdRlIT8FMGKG+BstgIAta2jJk225ECOgv2StbSAcEquLDpy+fGotyJ/uiwt/c72pJjXYv7LKEpBGx7N4R3hAFxLFyzfKtDvZrLYw55J/+YZzVjuvpHJazv8KmrzF/q/FUWJkOdZcPvLR4+4Z5K56pWaJEDdR+SK69V2fClbAKQ0eaWZV2xXgKUoSghk0vDPhR/m8ke2cLL3IRK5GuvBTAJIubm0IPQouqIogkja4P+jxFxxTzjXV7GSWejhnvEiQN3LUpLttu5UFKWhkI1X/13WbG15x3K6YvBArphrFadsv7RT5UpRJm7jbcjmG+Irqjc9lICtI9uVcs67NzNRFC0TLqjm+5FCryt6Bpr57SiKlgl1MVNG50V7h7Car0ZR1K+hwJm/GL4gnhMzyHFwCoqicJd1h6J6dcRa/5jwSlF0mvCbCdbep1dFABvNl6AoOk1IjIf/dnyXXi1C/N0JiqJMXHGT8N1y7vXugomVzWp+K4qihKB6RbwTiFngU1EUhfcuRIuQzPfCYTm/3EFUrr4ARSmQz5uLvPlmwJkTrBsxyXoiiqI4rJ80F0k03wq+OLbhX2qOZjaKogxu1EoVYTfv0QgrocorWzFfh6Io7d1+mr1+V98TB39ogOzN16MoigVsicb4kgWfypVWCRus+RNQFGWteMPti/mu1IeuC8XhjzEHUxRlzZtIy2s03xgfEBwQ8vKJtbE3fxCKoiiLFREJwPa2+8JnCfjCERxFURS+cBTbXpINIAv2vxpFURTfKl4JNi3/awcOLAAAQACARRT6/9/eSLY4DmCqO+MZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgQxN3yygAQHwAAAABJRU5ErkJggg==',
    overlayImageBounds,
    overlayOptions
);
groundOverlay.setMap(gmap);

var map = new fruskac.Map(gmap);

/*var clusterer = new MarkerClusterer(gmap, [], {
 maxZoom: 12,
 gridSize: 50,
 styles: [
 {
 textColor: 'white',
 url: 'img/sprite.png',
 backgroundPosition: '0 -523px',
 height: 32,
 width: 32
 },
 {
 textColor: 'white',
 url: 'img/sprite.png',
 backgroundPosition: '0 -443px',
 height: 48,
 width: 48
 },
 {
 textColor: 'white',
 url: 'img/sprite.png',
 backgroundPosition: '0 -379px',
 height: 64,
 width: 64
 }
 ]
 });

 clusterer.enabled = true;*/

var chart = new fruskac.Chart(document.getElementById('chart_container'));

/*
 * URL param: "l" defines layers visible. If not defined, default visibility will be used
 */

// default layers and their visibility
var layers = CONFIG_LAYERS;

var activeLayers = [];

var layersFromUrl = util.getParameterPartsByName(PARAMETER_LAYERS);

layers.forEach(function (layer) {

    if (layersFromUrl) { // if layer URL param exists, layers' visibility should follow
        layer.visible = layersFromUrl.indexOf(layer.name) !== -1;
    }

    activeLayers.push(Object.keys(layer).map(function(key) {
        return layer[key];
    }));

});


/*
 Load remote track
 */

var track = util.getParameterByName(PARAMETER_TRACK);

/*
 Load from "activeLayers"
 */

var loader = new fruskac.Loader();

var focus = util.getParameterByName(PARAMETER_FOCUS);

loader.load(activeLayers).then(function () {

    if (track) {
        // load external track
        loader.append(track, TYPE_TRACK).then(function (object) {
            google.maps.event.addListenerOnce(gmap, 'idle', function () {
                map.focus(object); // focus on appended object
            });
        })
    }

    if (focus) {
        // focus on selector
        google.maps.event.addListenerOnce(gmap, 'idle', function () {
            storage.focus(focus, true); // focus on selected object
        });
    }

    if (!(track || focus) && latLngZoom && latLngZoomParts && latLngZoomParts.length) {
        // add circle marker if track/location not set
        google.maps.event.addListenerOnce(gmap, 'idle', function () {
            map.placeMarker(new google.maps.LatLng(latLngZoomParts[0], latLngZoomParts[1]), null, true); // create pulsating marker
        });
    }

});