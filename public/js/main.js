// MOBILE MENU
const menuShow = document.querySelector('.hamburguer_menu');
const menuHide = document.querySelector('.mobile_menu_close');
const menu = document.querySelector('.nav_links_wrapper');

menuShow.addEventListener('click', function () {
    menu.setAttribute('mobile-show', 'true');
});
menuHide.addEventListener('click', function () {
    menu.setAttribute('mobile-show', 'false');
});
