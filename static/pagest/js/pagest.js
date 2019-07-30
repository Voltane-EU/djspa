window.pagest = Object.assign(window.pagest, {
    temp: {},
    loader: function(id, active, extra_classes, parent) {
        id += "_loader";
        var loader = document.getElementById(id);
        if(active && loader) {
            loader.style.display = "block";
        } else if(active && !loader) {
            loader = document.createElement("div");
            loader.id = id;
            loader.className = "loader "+(extra_classes || "");
            (parent || document.body).appendChild(loader);
        } else if(!active && loader)
            loader.remove();
        return loader;
    },
    load_page: function(page) {
        return new Promise((resolve, reject) => {
            var page_element = document.getElementById("ph-"+page);
            if(page_element.innerHTML)
                return resolve();
            this.loader("page-"+page, true, "full");
            fetch('/get_page/'+page+'?_='+(page_element.dataset.cache ? page_element.dataset.modified : Date.now()), {credentials: 'same-origin',}).then(async (response) => {
                this.loader("page-"+page, false);
                if(!response.ok)
                    return reject("response_not_ok");
                page_element.innerHTML = await response.text();
                return resolve();
            }).catch((error) => {
                this.loader("page-"+page, false);
                console.error(error);
                return reject("fetch_failed");
            });
        });
    },
    show_page: function(page) {
        return new Promise((resolve, reject) => {
            var pages = document.getElementById('ph-pages'),
                shown_pages = [],
                this_page = document.getElementById('ph-'+page);

            if(!this_page.hidden)
                return resolve();

            this.temp['show_page_hide_timer'] && clearInterval(this.temp['show_page_hide_timer']);
            this.temp['show_page_show_timer'] && clearInterval(this.temp['show_page_show_timer']);

            for(var i = 0; i < pages.children.length; i++) {
                if(!pages.children[i].hidden) {
                    pages.children[i].classList.add("hide");
                    shown_pages.push(pages.children[i]);
                }
            }
            this.temp['show_page_hide_timer'] = setTimeout(() => {
                requestAnimationFrame(() => {
                    for(var i = 0; i < shown_pages.length; i++) {
                        shown_pages[i].hidden = true;
                        shown_pages[i].classList.remove("hide");
                        this.trigger_on_page_hide(shown_pages[i].id.substr(3));
                    }
                    this_page.classList.add("show");
                    this_page.hidden = false;
                    this.temp['show_page_show_timer'] = setTimeout(() => {
                        this_page.classList.remove("show");
                    }, 125);
                    window.scrollTo(0, 0);
                    this.trigger_on_page_show(page);
                    resolve();
                });
            }, 125);
        });
    },
    get_current_page: function() {
        var url = new URL(window.location),
            path = this.path();
        return url.pathname === '/' ? 'index' : path[0];
    },
    path: function() {
        var url = new URL(window.location);
        return url.pathname.split('/').slice(1);
    },
    trigger_on_page_show: function(page) {
        if(!page)
            page = this.get_current_page();
        document.body.dataset.page = page;
        if(page in this.on_page_show)
            this.on_page_show[page]();
    },
    trigger_on_page_hide: function(page) {
        if(!page)
            return;
        if(page in this.on_page_hide)
            this.on_page_hide[page]();
    },
    on_popstate: function(event) {
        if(event && event.detail && event.detail.ignore_pagest)
            return;
        return new Promise((resolve, reject) => {
            var url = new URL(window.location.href),
            path = url.pathname.split('/');
            href = event && event.detail && event.detail.href ? event.detail.href : window.location.href;
            if(url.pathname === '/')
                path[1] = 'index';
            var page_element = document.getElementById('ph-'+path[1]);
            if(page_element) {
                pagest.load_page(path[1]).then(() => {
                    pagest.show_page(path[1]).then(resolve);
                }).catch((error) => {
                    console.warn("load_page failed", error);
                    window.location.href = event.detail.href;
                    reject();
                });
            } else
                window.location.href = event.detail.href;
        });
    },
    goto: function(url, replace, data, title) {
        data = data || {},
        title = title || null;
        return new Promise((resolve, reject) => {
            if(!url.startsWith("/")) {
                window.location = url;
                return resolve();
            }
            if(replace)
                window.history.replaceState(data, title, url);
            else
                window.history.pushState(data, title, url);
            this.on_popstate({detail: {href: url}}).then(() => {
                window.dispatchEvent(new CustomEvent("popstate", {detail: {ignore_pagest: true}}));
                resolve();
            }).catch(reject);
        });
    },
    get_param: function(name, remove, type) {
        if(!type)
            type = "hash";
        var query = window.location.hash.substr(1);
        if(type === "query")
            query = window.location.search;
        var hash = new URLSearchParams(query),
            re = hash.get(name);
        if(remove) {
            hash.delete(name);
            if(window.location.hash.substr(1) != hash.toString()) {
                if(hash.toString())
                    history.replaceState(null, null, "#"+hash.toString());
                else
                    history.replaceState(null, null, window.location.pathname);
            }
        }
        return re;
    },
    init: function() {
        this.trigger_on_page_show();
    },
});

(function() {
    document.addEventListener("readystatechange", () => {
        if(document.readyState === 'complete')
            pagest.init();
    });
    window.addEventListener("popstate", event => pagest.on_popstate(event));

    document.addEventListener("click", function(event) {
        if(!event.target.closest("a"))
            return;
        var a_elem = event.target.closest("a");
        if(!a_elem.href)
            return;
        var url = new URL(a_elem.href),
            path = url.pathname.split('/');
        if(a_elem.href === window.location.pathname) {
            event.preventDefault();
            return;
        }
        if(url.pathname === '/')
            path[1] = 'index';
        var page_element = document.getElementById('ph-'+path[1]);
        if(page_element) {
            event.preventDefault();
            window.history.pushState({}, null, a_elem.href);
            window.dispatchEvent(new CustomEvent("popstate", {detail: {href: a_elem.href}}));
        }
    });
})();
