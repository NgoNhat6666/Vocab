const translate = require('translate-google');
translate('hello world', {to: 'vi'}).then(res => {
    console.log(res);
}).catch(err => {
    console.error(err);
});
