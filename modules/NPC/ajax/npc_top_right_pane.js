/**
 * Created by Akkadius on 2/10/2015.
 */

$(document).ready(function() {
    var lootdrop_table = $(".loottable_entries").DataTable( {
        scrollY:        "75px",
        scrollX:        "200px",
        sScrollXInner: "320px",
        scrollCollapse: true,
        paging:         false,
        "searching": false,
        "ordering": false,
        "sDom": '<"top">rt<"bottom"flp><"clear">',
        "bSort" : false,

    } );

    $(".loottable_entries").css("width", "320px");
    var timer_2 = setInterval(function () {
        $(".lootdrop_entries").css("width", "320px");
        lootdrop_table.draw();
        window.clearInterval(timer_2);
    }, 100);

    /* Loot Table Click Hooks */
    $( ".loottable_entries tr" ).unbind( "click");
    $( ".loottable_entries tr" ).bind( "click", function() {
        loot_table = $(this).attr("loot_table");
        loot_drop = $(this).attr("loot_drop");
        probability = $(this).attr("probability");
        multiplier = $(this).attr("multiplier");
        data = $(this).html();

        console.log(loot_table + ' ' + loot_drop);

        /* We don't want anything to try and trigger on the table header */
        if($(this).parent('thead').length > 0)
            return;

        /* Highlight Row entry for loot table */
        $(".loottable_entries td").each(function() {
            $(this).css("background", "");
        });

        $(".loottable_entries td").each(function() {
            if($(this).attr("loot_drop") == loot_drop){
                $(this).css("background", "yellow");
            }
        });

        if($('#lootdrop_entries').attr('lootdrop_loaded') == loot_drop){
            return;
        }

        $.ajax({
            url: "ajax.php?M=NPC&show_lootdrop_entries=" + loot_drop + "&multiplier=" + multiplier + "&probability=" + probability,
            context: document.body
        }).done(function(e) {
            /* Update Data Table as well */
            $('#lootdrop_entries').html(e).fadeIn();
            $('#lootdrop_entries').attr('lootdrop_loaded', loot_drop);
            HookHoverTips();
        });

    });

    $( "#min_coin, #max_coin" ).unbind("change");
    $( "#min_coin, #max_coin" ).bind("change", function() {
        loot_table = $(this).attr('loot_table');
        /* Delete item from lootdrop */
        $.ajax({
            url: "ajax.php?M=NPC&do_cash_update=" + loot_table + "&field=" + $(this).attr('id') + "&value=" + $(this).val(),
            context: document.body
        }).done(function(e) {
            Notific8("NPC Editor", "Updated " + $(this).attr('id') + " to value " + $(this).val(), 2000);
        });
    });

    /* Hook Mouse Enter and Leave Events for Loottable (table) */
    $( ".loottable_entries td" ).unbind("mouseenter");
    $( ".loottable_entries td" ).bind("mouseenter", function() {
        loot_table = $(this).parent().attr("loot_table");
        loot_drop = $(this).parent().attr("loot_drop");
        field_name = $(this).attr("field_name");
        width = $(this).css("width");
        height = $(this).css("height");
        data = $(this).html();

        /* If attr is set to non edit, return */
        if($(this).attr("nonedit") == 1){
            return;
        }

        /* Dont replace the button */
        if(data.match(/button/i)){ return; }

        $(this).html('<input type="text" class="form-control" value="' + data + '" onchange="update_loottable(' + loot_table + ', ' + loot_drop + ', \'' + field_name + '\', this.value)">');
        $(this).children("input").css('width', (parseInt(width) * 1));
        $(this).children("input").css('height', (parseInt(height)));
        $(this).children("input").css("font-size", "12px");
        // $('textarea').autosize();
        data = "";
    });

    /* Hook Mouse Leave Events for Loottable (table) */
    $( ".loottable_entries td" ).unbind("mouseleave");
    $( ".loottable_entries td" ).bind("mouseleave", function() {
        data = "";

        /* Grab data from cell depending on input type */
        if($(this).has("select").length){
            data = $(this).children("select").val();
        }
        else if($(this).has("input").length){
            data = $(this).children("input").val();
        }

        /* If cell contains cell... skip */
        if($(this).has("button").length){ return; }

        /* If no data present and */
        if(!data && (!$(this).has("select").length && !$(this).has("input").length)){
            $(this).attr("is_field_translated", 0);
            return;
        }

        $(this).html(data);
        data = "";
        $(this).attr("is_field_translated", 0);
    });
});

function update_loottable(loot_table, loot_drop, field_name, val){
    $.ajax({
        url: "ajax.php?M=NPC&update_loottable=" + loot_table + "&loot_drop=" + loot_drop + "&field=" + field_name + "&value=" + val,
        context: document.body
    }).done(function(e) {
        /* Update Data Table as well */
        $('#lootdrop_entries').html(e).fadeIn();
        Notific8("NPC Editor", loot_drop + " :: Updated " + field_name + " to value '" + val + "'", 3000);
    });
}

function update_loot_drop(loot_drop, item_id, field_name, val){
    $.ajax({
        url: "ajax.php?M=NPC&update_loot_drop=" + loot_drop + "&item_id=" + item_id + "&field=" + field_name + "&value=" + val,
        context: document.body
    }).done(function(e) {
        /* Update Data Table as well */
        Notific8("NPC Editor", "Loot Drop :: Updated " + field_name + " to value '" + val + "' for item " + item_id, 1000);
        if(e != ''){
            alert(e);
        }
    });
}

function loottable_add(loottable_id){
    DoModal("ajax.php?M=NPC&loottable_add=" + loottable_id);
}

function loot_drop_add_item(loot_drop_add_item){
    DoModal("ajax.php?M=NPC&loot_drop_add_item=" + loot_drop_add_item);
}

function reload_lootdrop_entries_table_pane(loot_drop){
    /* Lets Update the top right pane */
    $.ajax({
        url: "ajax.php?M=NPC&show_lootdrop_entries=" + loot_drop,
        context: document.body
    }).done(function(e) {
        /* Update Data Table as well */
        $('#lootdrop_entries').html(e).fadeIn();
        $('#lootdrop_entries').attr('lootdrop_loaded', loot_drop);
        HookHoverTips();
    });
}

function loot_search_result(search){
    /* Lets Update the top right pane */
    $.ajax({
        url: "ajax.php?M=NPC&show_lootdrop_entries=" + loot_drop,
        context: document.body
    }).done(function(e) {
        /* Update Data Table as well */
        $('#lootdrop_entries').html(e).fadeIn();
        $('#lootdrop_entries').attr('lootdrop_loaded', loot_drop);
        HookHoverTips();
    });
}

function add_to_lootdrop(loot_drop, item_id){
    $.ajax({
        url: "ajax.php?M=NPC&db_loot_drop_add_item=" + item_id + "&loot_drop=" + loot_drop,
        context: document.body
    }).done(function(e) {
        Notific8("NPC Editor", loot_drop + " :: Added " + item_id + " ", 2000);
        reload_lootdrop_entries_table_pane(loot_drop);
    });
}

function do_lootdrop_delete(lootdrop_id, item_id){
    DoModal("ajax.php?M=NPC&do_lootdrop_delete=" + lootdrop_id + "&item_id=" + item_id);
}

function do_lootdrop_delete_confirmed(lootdrop_id, item_id){
    /* Delete item from lootdrop */
    $.ajax({
        url: "ajax.php?M=NPC&do_lootdrop_delete_confirmed=" + lootdrop_id + "&item_id=" + item_id,
        context: document.body
    }).done(function(e) {
        $('#ajax-modal').modal('hide');
        Notific8("NPC Editor", "Removed item: " + item_id + " from Lootdrop ID: " + lootdrop_id + "" + e, 2000);
        /* Refresh Table when removed */
        reload_lootdrop_entries_table_pane(lootdrop_id);
    });
}

function do_loot_table_delete(loot_table, loot_drop_id){
    DoModal("ajax.php?M=NPC&do_loot_table_delete=" + loot_table + "&loot_drop_id=" + loot_drop_id);
}

function do_loot_table_delete_confirmed(loot_table, loot_drop_id){
    /* Delete item from lootdrop */
    $.ajax({
        url: "ajax.php?M=NPC&do_loot_table_delete_confirmed=" + loot_table + "&loot_drop_id=" + loot_drop_id,
        context: document.body
    }).done(function(e) {
        $('#ajax-modal').modal('hide');
        Notific8("NPC Editor", "Removed Lootdrop ID: " + loot_drop_id + " from Loot Table ID: " + loot_table, 2000);
        if(e != ''){
            alert(e);
        }
        /* Remove Row physically from table */
        $(".loottable_entries tr").each(function() {
            if($(this).attr("loot_drop") == loot_drop_id){
                $(this).remove();
            }
        });
    });
}

function do_loottable_delete(loottable_id, lootdrop_id){
    DoModal("ajax.php?M=NPC&do_loottable_delete=" + loottable_id + "&lootdrop_id=" + lootdrop_id);
}

function do_make_npc_kos(npc_id){
    update_npc_field(npc_id, 'npc_faction_id', 19471);
}

function do_npc_special_abilities_edit(){
    db_field = 'special_abilities';
    npc_id = $('#top_right_pane').attr('npc_loaded');
    input_data = $( "td[" + npc_id + "-" + db_field + "]").html();
    DoModal("ajax.php?M=NPC&special_abilities_editor&val=" + input_data + "&npc_id=" + npc_id + "&db_field=" + db_field);
}

function do_spawn_editor(npc_id){
    npc_id = typeof npc_id !== 'undefined' ? npc_id : 0;
    DoModal("ajax.php?M=NPC&do_spawn_editor=" + npc_id);
}