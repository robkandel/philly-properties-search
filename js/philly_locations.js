////////////////////////////////////////////////////||
// ROB KANDEL  										||
// kandelrob@gmail.com								||
// 													||
// created 01.28.15	| updated 02.02.15				||
// philly_locations.js								||
// version 0.0.1									||
////////////////////////////////////////////////////||
var _global = (function() {
    var method = {
        init: function() {
            method.move_preloader();
            method.backbone.init();
        },
        menu_toggle: function() {
            jQuery('.menuButton').on('click', function() {
                if (jQuery(this).hasClass('navIconActive')) {
                    jQuery(this).removeClass('navIconActive');
                    jQuery('#nav_list').removeClass('navListWrapperActive');
                } else {
                    jQuery(this).addClass('navIconActive');
                    jQuery('#nav_list').addClass('navListWrapperActive');
                }
            });
        },
        move_preloader: function() {
            jQuery(window).on('resize, scroll', function() {
                if (jQuery('.preloaderWrapper').is(':visible')) {
                    jQuery('.preloaderSpinnerWrapper').css({
                        'top': jQuery(window).scrollTop()
                    });
                }
            })
        },
        setup_search_form: function() {
            jQuery('#address').on('focus', function() {
                if (jQuery('#address').val() == 'Ex: 1234 Market Street') {
                    jQuery('#address').val('')
                }
            }).on('blur', function() {
                if (jQuery('#address').val() == '') {
                    jQuery('#address').val('Ex: 1234 Market Street')
                }
            }).on('keyup', function(event) {
                if (event.keyCode == 13) {
                    jQuery('#address-search').click();
                }
            });
            jQuery('#address-search').on('click', function() {
                (jQuery('#address').val() == '' || jQuery('#address').val() == 'Ex: 1234 Market Street') ? alert('Please enter an address'): (window.location.href = ('#!/search/' + jQuery('#address').val()));
            });
        },
        make_active_menu: function(a) {
            jQuery('.dropDownListItemActive').removeClass('dropDownListItemActive');
            jQuery("li[data-value='" + a + "']").addClass('dropDownListItemActive');
        },
        set_more_toggle: function() {
            jQuery('.btn-showAll').each(function() {
                jQuery(this).unbind();
                jQuery(this).on('click', function() {
                    if (jQuery(this).hasClass('btn-showLess')) {
                        jQuery(this).removeClass('btn-showLess').find('span').html('Show All');
                        jQuery(this).parent().find('.rowHidden').each(function() {
                            jQuery(this).slideUp(150);
                        });
                    } else {
                        jQuery(this).addClass('btn-showLess').find('span').html('Show Less');
                        jQuery(this).parent().find('.rowHidden').each(function() {
                            jQuery(this).slideDown(150);
                        });
                    }
                });
            })
        },
        setup_pagination: function() {
            if (jQuery('#pagination')[0]) {
                jQuery('#pagination').blur(function() {
                    method.get_pagination_value(jQuery(this).val());
                }).keyup(function(event) {
                    if (event.keyCode == 13) {
                        method.get_pagination_value(jQuery(this).val());
                    }
                });
            }
        },
        get_pagination_value: function(a) {
            var _num = a.split('/')[0];
            if (_num != '' && !isNaN(_num)) {
                _num--;
                if (parseFloat(_num) <= Math.ceil(parseFloat(jQuery('.totalCountData').html()) / 30) && parseFloat(_num) >= 0) {
                    method.change_pagination(_num);
                }
            }
        },
        change_pagination: function(a) {
            var _base = window.location.hash.substring(1);
            location.hash = ((_base.indexOf('?page=') == -1) ? (window.location.hash.substring(1) + ('?page=' + a)) : (window.location.hash.substring(1).split('?page=')[0] + ('?page=' + a)));
        },
        backbone: {
            init: function() {
                var _router = Backbone.Router.extend({
                    routes: {
                        "": 'home',
                        "!/search/:id": "search",
                        '!/search/:id?*query': 'search',
                        "!/address/:id": "detail"
                    }
                });
                var _global_router = new _router;
                _global_router.on('route:home', function() {
                    method.backbone.menu(false)
                    method.backbone.home(false, 'Ex: 1234 Market Street');
                });
                _global_router.on('route:search', function(id) {
                    method.backbone.menu(true)
                    method.backbone.search(id, false);
                });
                _global_router.on('route:detail', function(id) {
                    method.backbone.menu(true)
                    method.backbone.search(id, true);
                });
                Backbone.history.start();
            },
            menu: function(a) {
                var _menu = Backbone.View.extend({
                    el: '.navWrapper',
                    template: '#nav-options',
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    render: function(options) {
                        var _menu = this;
                        var template = _.template($(_menu.template).html(), {
                            bool: a
                        });
                        _menu.$el.html(template);
                        method.menu_toggle();
                    }
                });
                var _menu = new _menu();
                //_menu.render();
            },
            home: function(a, b) {
                jQuery('.content').empty();
                jQuery('.formHolder').empty();
                jQuery('.content-li').empty();
                var _address_search_form = Backbone.View.extend({
                    el: ((a) ? '.formHolder' : '.content'),
                    template: ((a) ? "#address-search-form" : '#home-page'),
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    cancel: function(e) {
                        e.preventDefault();
                    },
                    render: function(options) {
                        var _search = this;
                        var template = _.template($(_search.template).html(), {
                            address: b.split('?')[0]
                        });
                        _search.$el.html(template);
                        method.setup_search_form();
                    }
                });
                var _address_search_form = new _address_search_form();
                _address_search_form.render();
            },
            search: function(id, bool) {
                jQuery('.preloaderWrapper').show();
                jQuery('.preloaderSpinnerWrapper').css({
                    'top': jQuery(window).scrollTop()
                });
                jQuery('.content').empty();
                jQuery('.formHolder').empty();
                jQuery('.content-li').empty();
                var _address = Backbone.Model.extend({
                    url: function() {
                        return 'http://api.phila.gov/opa/v1.1/address/' + method.format.format_search_url(this.id) + '?format=json' + method.format.format_pagination(this.id);
                    }
                });
                var _address_search_view = Backbone.View.extend({
                    el: '.content',
                    template: ((!bool) ? "#address-search-template-multiple" : '#address-search-template-detail'),
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    cancel: function(e) {
                        e.preventDefault();
                    },
                    render: function(options) {
                        var _search = this;
                        if (options.id) {
                            _search.search = new _address({
                                id: options.id.toLowerCase()
                            });
                            _search.search.fetch({
                                success: function(data) {
                                    if (data.attributes.data.properties.length > 0) {
                                        _.extend(data.attributes, method.backbone.view_helper);
                                        var template = _.template($(_search.template).html(), {
                                            results: data.attributes,
                                            pagination_num: ((method.format.format_pagination(options.id) == '') ? 0 : (parseFloat(method.format.format_pagination(options.id).replace('&skip=', '')) / 30))
                                        });
                                        _search.$el.html(template);
                                        if (bool) {
                                            method.map.init();
                                            method.backbone.location_id(data)
                                        }
                                        if (parseFloat(data.attributes.total) > 30) {
                                            method.setup_pagination();
                                        }
                                        jQuery('.preloaderWrapper').hide();
                                    } else {
                                        var template = _.template($('#address-zero-results-template').html());
                                        _search.$el.html(template);
                                        jQuery('.preloaderWrapper').hide();
                                    }
                                },
                                error: function(data) {
                                    var template = _.template($('#address-error-template').html());
                                    _search.$el.html(template);
                                    jQuery('.preloaderWrapper').hide();
                                }
                            });
                            method.backbone.home(true, decodeURIComponent(options.id));
                        } else {
                            var template = _.template($(_search.template).html());
                            _search.$el.html(template);
                            method.setup_search_form();
                        }
                    }
                });
                var _address_search_view = new _address_search_view();
                _address_search_view.render({
                    id: id
                });
            },
            location_id: function(id) {
                _address = (decodeURIComponent(id.attributes.id)).toUpperCase()
                jQuery.ajax({
                    type: 'GET',
                    data_type: 'json',
                    url: "http://services.phila.gov/PhillyApi/Data/v0.7/Service.svc/locations?$filter=" + method.format.format_location_url(_address) + "&$format=json",
                    success: function(data) {
                        if (data.d.results.length > 0) {
                            method.backbone.licenses(data.d.results[0].location_id);
                            method.backbone.permits(data.d.results[0].location_id);
                            method.backbone.violations(data.d.results[0].location_id);
                        }
                    }
                });
            },
            permits: function(id) {
                var _permits = Backbone.Model.extend({
                    url: function() {
                        //return "http://api.phila.gov/PhillyApi/Data/v1.0/locationhistories?&$format=json&$filter=(location_id eq "+this.id+")";
                        return "http://api.phila.gov/PhillyApi/Data/v1.0/permits?&$format=json&$filter=(location_id eq " + this.id + ")";
                    }
                });
                var _permits_view = Backbone.View.extend({
                    el: '#li_permits',
                    permit_template: '#address-search-template-details-permits',
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    cancel: function(e) {
                        e.preventDefault();
                    },
                    render: function(options) {
                        var _search = this;
                        if (options.id) {
                            _search.search = new _permits({
                                id: options.id
                            });
                            _search.search.fetch({
                                success: function(data) {
                                    if (data.attributes.d.results.length > 0) {
                                        _.extend(data.attributes.d.results, method.backbone.view_helper);
                                        var template = _.template($(_search.permit_template).html(), {
                                            permits: data.attributes.d.results
                                        });
                                        _search.$el.append(template);
                                        method.set_more_toggle();
                                    }
                                }
                            });
                        } else {

                        }
                    }
                });
                var _permits_view = new _permits_view();
                _permits_view.render({
                    id: id
                });
            },
            licenses: function(id) {
                var _licenses = Backbone.Model.extend({
                    url: function() {
                        return "http://api.phila.gov/PhillyApi/Data/v1.0/licenses?&$format=json&$filter=(location_id eq " + this.id + ")";
                    }
                });
                var _licenses_view = Backbone.View.extend({
                    el: '#li_licenses',
                    permit_template: '#address-search-template-details-licenses',
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    cancel: function(e) {
                        e.preventDefault();
                    },
                    render: function(options) {
                        var _search = this;
                        if (options.id) {
                            _search.search = new _licenses({
                                id: options.id
                            });
                            _search.search.fetch({
                                success: function(data) {
                                    if (data.attributes.d.results.length > 0) {
                                        _.extend(data.attributes.d.results, method.backbone.view_helper);
                                        var template = _.template($(_search.permit_template).html(), {
                                            licenses: data.attributes.d.results
                                        });
                                        _search.$el.append(template);
                                        method.set_more_toggle();
                                    }
                                }
                            });
                        } else {

                        }
                    }
                });
                var _licenses_view = new _licenses_view();
                _licenses_view.render({
                    id: id
                });
            },
            violations: function(id) {
                var _violations = Backbone.Model.extend({
                    url: function() {
                        return "http://api.phila.gov/PhillyApi/Data/v1.0/violationdetails?&$format=json&$filter=(location_id eq " + this.id + ")";
                    }
                });
                var _violations_view = Backbone.View.extend({
                    el: '#li_violations',
                    permit_template: '#address-search-template-details-violations',
                    initialize: function() {
                        _.bindAll(this, 'render');
                    },
                    cancel: function(e) {
                        e.preventDefault();
                    },
                    render: function(options) {
                        var _search = this;
                        if (options.id) {
                            _search.search = new _violations({
                                id: options.id
                            });
                            _search.search.fetch({
                                success: function(data) {
                                    if (data.attributes.d.results.length > 0) {
                                        _.extend(data.attributes.d.results, method.backbone.view_helper);
                                        var template = _.template($(_search.permit_template).html(), {
                                            violations: data.attributes.d.results
                                        });
                                        _search.$el.append(template);
                                        method.set_more_toggle();
                                    }
                                }
                            });
                        } else {

                        }
                    }
                });
                var _violations_view = new _violations_view();
                _violations_view.render({
                    id: id
                });
            },
            breakdown_history_data: function(d) {
                var _temp = {}
                for (var i = 0; i < d.length; i++) {
                    if (!(d[i].entity_name in _temp)) {
                        _temp[d[i].entity_name] = []
                    }
                    var _info = {
                        category: d[i].entity_category,
                        id: d[i].entity_id,
                        type: d[i].entity_type

                    }
                    _temp[d[i].entity_name].push(_info)
                }
                return _temp;
            },
            view_helper: {
                capitalize_text: function(str) {
                    return str.replace(/\w\S*/g, function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                },
                pagination_list: function(a) {
                    var _temp = []
                    for (var i = 0; i < Math.ceil(a / 30); i++) {
                        _temp.push(i)
                    }
                    return _temp
                },
                pagination_url: function(a, b) {
                    if (a <= 0) {
                        a = 0;
                    }
                    if (a > b - 1) {
                        a = b - 1
                    }
                    var _base = window.location.hash.substring(1);
                    return '#' + ((_base.indexOf('?page=') == -1) ? (window.location.hash.substring(1) + ('?page=' + a)) : (window.location.hash.substring(1).split('?page=')[0] + ('?page=' + a)));
                },
                status_class: function(a) {
                    if (typeof(a) === 'undefined') {
                        return ''
                    }
                    b = a.toLowerCase();
                    switch (true) {
                        case b == 'completed':
                            return 'success';
                            break;
                        case b == 'complied':
                            return 'warning';
                            break;
                        case b == 'active':
                            return 'active';
                            break;
                        case b == 'expired':
                            return 'warning';
                            break;
                        case b == 'not complied':
                            return 'danger';
                            break;
                    }
                    return 'active'
                }
            }
        },
        map: {
            init: function() {
                var _map = L.map('the_map', {
                    scrollWheelZoom: false,
                    center: [parseFloat(jQuery('#the_map').attr('data-lat')), parseFloat(jQuery('#the_map').attr('data-lng'))],
                    zoom: 16,
                    detectRetina: true
                });
                _map.dragging.disable();
                _map.keyboard.disable();
                var _layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                }).addTo(_map);
                var _marker = L.marker([parseFloat(jQuery('#the_map').attr('data-lat')), parseFloat(jQuery('#the_map').attr('data-lng'))]).addTo(_map);
            }
        },
        format: {
            format_search_url: function(url) {
                var _the_url = decodeURIComponent(url).split('?')[0];
                var _url = _the_url.toLowerCase().replace(/\./g, '').replace(' unit #', '/').replace(' apt #', '/').replace(' condo #', '/').replace(' unit#', '/').replace(' apt#', '/').replace(' condo#', '/');
                if (_url.indexOf(' apt') != -1 && _url[_url.indexOf(' apt') + 4] == ' ') {
                    _url = _url.replace(' apt ', '****');
                }
                if (_url.indexOf(' unit') != -1 && _url[_url.indexOf(' unit') + 5] == ' ') {
                    _url = _url.replace(' unit ', '****');
                }
                if (_url.indexOf(' condo') != -1 && _url[_url.indexOf(' condo') + 6] == ' ') {
                    _url = _url.replace(' condo ', '****');
                }
                var _temp = _url.split('****');
                _base = encodeURIComponent(_temp[0]);
                if (_temp.length > 1) {
                    _base += ('/' + encodeURIComponent(_temp[1]));
                } else {
                    _base += '/';
                }
                return _base.toUpperCase();
            },
            format_pagination: function(url) {
                if (decodeURIComponent(url).split('?').length > 1) {
                    var _page = method.format.get_parameter_by_name('page', url);
                    var _pagination = '&skip=' + ((!isNaN(_page)) ? (_page * 30).toString() : '0');
                    return _pagination
                } else {
                    return '';
                }
            },
            format_location_url: function(url) {
                var _address = url.toUpperCase();
                var _num = _address.replace(/(^\d+)(.+$)/i, '$1');
                _address = _address.replace(_num, '');
                var _unit = '';
                if (_address.indexOf(' UNIT ') != -1) {
                    _unit = _address.split(' UNIT ')[1];
                    _address = _address.split(' UNIT ')[0];
                }
                var _temp = _address.split(' ')
                _temp.shift()
                var _direction = '';
                if (_temp[0].length == 1) {
                    _direction = _temp[0]
                    _temp.shift();
                }
                var _suffix = _temp[_temp.length - 1];
                _temp.pop();
                var _street = _temp.join().replace(/,/g, ' ')
                var _query = "(street_number eq ' " + method.format.zero_out(_num) + "') and (street_name eq '" + _street + "')" + ((_direction != '') ? ("and (street_direction eq '" + _direction + "')") : '') + ((_suffix != '') ? ("and (street_suffix eq '" + _suffix + "')") : '') + ((_unit != '') ? ("and (unit_number eq '" + _unit + "')") : '');
                return _query

            },
            zero_out: function(a) {
                return (Math.pow(10, Math.max(0, 5 - Math.floor(Math.abs(a)).toString().length)).toString().substr(1)).toString() + (Math.abs(a)).toString();
            },
            detail_url: function(a) {
                var _url = method.format.format_search_url((a.address_match.standardized) + (('unit' in a && a.unit != '') ? (' Unit ' + a.unit.replace(/\b0+/g, '')) : ''))
                if (_url[_url.length - 1] != '/') {
                    return _url.replace('/', ' unit ').toUpperCase();
                } else {
                    return _url.replace('/', '').toUpperCase();
                }
            },
            get_parameter_by_name: function(a, b) {
                a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + a + "=([^&#]*)"),
                    _results = regex.exec(b);
                return _results === null ? "" : decodeURIComponent(_results[1].replace(/\+/g, " "));
            },
            readable_date: function(a) {
                return new Date(parseFloat(a.replace(/\//g, '').replace('Date(', '').replace(')', '').split('-')[0])).toDateString();
            },
            add_commas: function(a) {
                a += '';
                var x = a.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }
        }
    };
    return method;
})();