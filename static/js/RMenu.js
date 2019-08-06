(function() {
    var that;
    var arr = new Array();
    var html = "";
    !function(e) {
        e.RMenu = {
            init: function(per) {
                if (typeof (per) != "object" && !per.hasOwnProperty('area') && !per.hasOwnProperty('items') && !per.hasOwnProperty('callback'))
                    throw "json 数据错误";
                that = this;
                this.showmenu(per);
                var areaHeight = $(per.area).height();
                var areaWidth = $(per.area).width();
                var menuHeight = $('.RCM-Main').height();
                var menuWidth = $('.RCM-Main').width();
                $(per.area).bind('contextmenu', function() {
                    var xPos = parseInt(event.pageX + 10);
                    var yPos = event.pageY;
                    if (areaWidth - xPos < menuWidth) {
                        xPos = (xPos - menuWidth - 20);
                        $('.RCM-container').css({
                            left: (xPos - menuWidth - 20) + "px",
                            top: yPos + "px"
                        }).show();
                    }
                    if (areaHeight - yPos < menuHeight) {
                        yPos = (yPos - menuHeight - 20);
                    }
                    $('.RCM-Main').css({
                        left: xPos + "px",
                        top: yPos + "px"
                    }).show();
                    return false;
                })
                $(per.area).on('click', function() {
                    $('.RCM-container').hide();
                });
                $('.RCM-container li').on('click', function() {
                    var content = $(this).data('content');
                    $('.RCM-container').hide();
                    per.callback({
                        event: 'click',
                        data: content
                    });
                });
                $('.RCM-container ul li,.RCM-child li').mouseover(function(e) {
                    if ($(this).find('i').hasClass('fa-align-right')) {
                        var width = $(this).find('i').next('.RCM-child').width();
                        $(this).find('i').next('.RCM-child').css('left', width).show();
                    }
                });
                $('.RCM-container ul li,.RCM-child li').mouseout(function() {
                    $('.RCM-child').hide();
                });
            },
            contextMenu: function(per, key) {
                var key = key ? key : "Main";
                html += '<div class="RCM-container RCM-' + key + '"><ul>';
                $.each(per.items, function(item, val) {
                    var icon = val.icon ? '<i class="fa fa-' + val.icon + ' fa-fw ">&nbsp;' : ''
                    var center = val.icon ? 'nocenter' : 'textcenter';
                    var iconAfter = val.items ? '<i class="fa fa-chevron-right fa-fw fa-align-right">&nbsp;' : '';
                    html += '<li data-content=' + item + ' class="' + center + '">' + icon + '</i>' + val.name + iconAfter + '</i>';
                    if (val.hasOwnProperty('items')) {
                        that.contextMenu(val, 'child');
                    }
                    html += '</li>';
                });
                html += "</ul></div>";
                return html;
            },
            showmenu: function(per) {
                var ce = this.contextMenu(per);
                $(per.area).append(ce);
                $('.RCM-container').hide();
            }
        };
    }(window)
}
)();
