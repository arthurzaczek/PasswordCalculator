var sites = [];

var template_all = "abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!$%&/()=?-_,.;:";
var template_simple = "abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var template_numbers = "1234567890";

var ctrl_saveName;
var ctrl_name;
var ctrl_serviceUrl;
var ctrl_masterPassword;

var ctrl_fileImport;
var ctrl_accordion;

var ctrl_btnUseCurrentUrl;
var ctrl_btnAdd;
var ctrl_btnExport;

function generatePassword(site) {
    var source = "" + ctrl_masterPassword.val() + "-" + ctrl_name.val() + "-" + site.name + "-" + site.counter;
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
    $.each(sites, function (idx, item) {
        $('#password-' + idx).val(generatePassword(item));
    });
}

function appendSiteHtml(idx, item) {
    $('<div class="panel panel-default" id="site-panel-' + idx + '">').append(
        $('<div class="panel-heading">').append(
            $('<h4 class="panel-title">').append(
                $('<a data-toggle="collapse" data-parent="#accordion" href="#collapse-' + idx + '">').text(item.name)
            )
        ),
        $('<div id="collapse-' + idx + '" class="panel-collapse collapse">').append(
            $('<div class="panel-body">').append(
                $('<input type="text" readonly class="form-control password-control" id="password-' + idx + '">').val(''),
                $('<button class="btn btn-danger pull-right spacer" onclick="removeSite(' + idx + ')">Remove</button>'),
                $('<p class="spacer">').text('Template: ' + item.template + "; Counter: " + item.counter)
            )
        )
    ).appendTo('#accordion');
}

function addSite() {
    var site = {
        "name": $('#site').val(),
        "template": $('#template').val(),
        "counter": $('#counter').val()
    };
    var i = sites.length;
    appendSiteHtml(i, site);
    sites.push(site);
    localStorage.sites = JSON.stringify(sites);

    generatePasswords();
}

function removeSite(idx) {
    sites.splice(idx, 1);
    $('#site-panel-' + idx).remove();

    localStorage.sites = JSON.stringify(sites);

    generatePasswords();
}

$(function () {
	// grab and save controls
	ctrl_name = $('#name');
	ctrl_saveName = $('#saveName');
	ctrl_masterPassword = $('#masterPassword');
	ctrl_serviceUrl = $('#serviceUrl');

	ctrl_fileImport = $("#fileImport");
	ctrl_accordion = $('#accordion');

	ctrl_btnUseCurrentUrl = $('#btnUseCurrentUrl');
	ctrl_btnAdd = $('#btnAdd');
	ctrl_btnExport = $("#btnExport");

	// restore sites	
    if (localStorage.sites) {
        sites = JSON.parse(localStorage.sites);
    }
    $.each(sites, appendSiteHtml);
	
	// initialize basic information section
    if (localStorage.saveName) {
        ctrl_saveName.prop('checked', true);
    }
    ctrl_name.val(localStorage.name);
    ctrl_name.on('input propertychange paste', function () {
        if (localStorage.saveName) {
            localStorage.name = ctrl_name.val();
        }
        generatePasswords();
    });
    ctrl_saveName.click(function () {
        if (ctrl_saveName.prop('checked')) {
            localStorage.saveName = true;
            localStorage.name = ctrl_name.val();
        } else {
            localStorage.removeItem('saveName');
            localStorage.name = "";
        }
    });

	// master password
	ctrl_masterPassword.on('input propertychange paste', function () {
        generatePasswords();
    });
	
	// new site
    ctrl_btnAdd.click(addSite);

	
	// Export/Import
	if(localStorage.serviceUrl) {
		ctrl_serviceUrl.val(localStorage.serviceUrl);
	} else {
		ctrl_serviceUrl.val(document.baseURI.substr(0,document.URL.lastIndexOf('/')));
	}
    ctrl_serviceUrl.on('input propertychange paste', function () {
		localStorage.serviceUrl = ctrl_serviceUrl.val();
    });

	ctrl_btnUseCurrentUrl.click(function() {
		var url = document.baseURI.substr(0,document.URL.lastIndexOf('/'));
		ctrl_serviceUrl.val(url);
		localStorage.serviceUrl = url;
	});

    ctrl_btnExport.click(function () {
        this.href = 'data:plain/text,' + JSON.stringify(sites);
    });

    ctrl_fileImport.change(function (event) {
        var fr = new FileReader();
        fr.onload = function () {
            sites = JSON.parse(this.result);
            localStorage.sites = JSON.stringify(sites);
            ctrl_accordion.empty();
            $.each(sites, appendSiteHtml);
            generatePasswords();
        }
        fr.readAsText(this.files[0]);
    });
});