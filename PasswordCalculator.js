var sites = [];

var template_all = "abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!$%&/()=?-_,.;:";
var template_simple = "abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var template_numbers = "1234567890";

function generatePassword(site) {
    var source = "" + $('#masterPassword').val() + "-" + $('#name').val() + "-" + site.name + "-" + site.counter;
    var hash = wordArrayToUint8Array(CryptoJS.SHA256(source));
    var template, size;

    switch (site.template) {
        case 'default-long':
            template = template_all;
            size = 32;
            break;
        case 'default-medium':
            template = template_all;
            size = 10;
            break;
        case 'default-short':
            template = template_all;
            size = 6;
            break;
        case 'simple-long':
            template = template_simple;
            size = 32;
            break;
        case 'simple-medium':
            template = template_simple;
            size = 10;
            break;
        case 'simple-short':
            template = template_simple;
            size = 6;
            break;
        case 'pin-medium':
            template = template_numbers;
            size = 10;
            break;
        case 'pin-short':
            template = template_numbers;
            size = 4;
            break;
        default:
            return "Unknown template";
    }

    var i, j, b, result = "";
    for (i = 0; i < hash.length && i < size; i++) {
        b = hash[i];
        result += template.charAt(b % template.length);
    }

    return result;
}

// wordArray is Big-Endian, its from crypto js
// https://gist.github.com/creationix/07856504cf4d5cede5f9#file-encode-js
function wordArrayToUint8Array(wordArray) {
    var len = wordArray.words.length;
    var u8_array = new Uint8Array(len << 2);
    var offset = 0, word, i;
    for (i = 0; i < len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = (word >> 16) & 0xff;
        u8_array[offset++] = (word >> 8) & 0xff;
        u8_array[offset++] = word & 0xff;
    }
    return u8_array;
}

function generatePasswords() {
    $.each(sites, function (i, item) {
        $('#password-' + i).val(generatePassword(item));
    });
}

function appendSite(i, item) {
    $('<div class="panel panel-default">').append(
        $('<div class="panel-heading">').append(
            $('<h4 class="panel-title">').append(
                $('<a data-toggle="collapse" data-parent="#accordion" href="#collapse-' + i + '">').text(item.name)
            )
        ),
        $('<div id="collapse-' + i + '" class="panel-collapse collapse">').append(
            $('<div class="panel-body">').append(
                $('<input type="text" readonly class="form-control" id="password-' + i + '">').val('')
            )
        )
    ).appendTo('#accordion');
}

$(function () {
    if (localStorage.sites) {
        sites = JSON.parse(localStorage.sites);
    }

    $.each(sites, function (i, item) {
        appendSite(i, item);
    });

    $('#masterPassword, #name').on('input propertychange paste', function () {
        generatePasswords();
    });
    $('#btnAdd').click(function () {
        var site = {
            "name": $('#site').val(),
            "template": $('#template').val()
        };
        var i = sites.length;
        appendSite(i, site);
        sites.push(site);
        localStorage.sites = JSON.stringify(sites);

        generatePasswords();
    });
});