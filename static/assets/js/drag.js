var list = document.getElementsByClassName("sortable-list");
var draggingitem = null;
var dragging_from_list = null;

console.log(list);

function dragstart(e){
    draggingitem = e.target;
    dragging_from_list = e.target.closest('.sortable-list');
    e.target.classList.add('dragging');
    console.log("Drag Started");
}




function dragover(e){
    e.preventDefault();
    console.log("Drag Working");
    var draggingOverItem = getDragAfterElement(dragging_from_list, e.clientY);
    var sortable_items = dragging_from_list.getElementsByClassName('sortable-item');
    for (var i = 0; i < sortable_items.length; i++){
        sortable_items[i].classList.remove('over');
        //clearify the over tag
    }

    if (draggingOverItem) {
    draggingOverItem.classList.add('over');
    dragging_from_list.insertBefore(draggingitem, draggingOverItem);
    } else {
    dragging_from_list.appendChild(draggingitem);
    e.target.classList.add('dragging');
    }
}

function getDragAfterElement(container, y){
    var draggableElements = container.querySelectorAll(".sortable-item:not(.dragging)");   //allows query without loop
    var closest = { offset: Number.NEGATIVE_INFINITY, element: null };

     for (var j = 0; j < draggableElements.length; j++) {
        var child = draggableElements[j];
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            closest = { offset: offset, element: child };
        }

    }
    return closest.element;    
}

function dragend(e){
    console.log("Drag Ended");
    e.target.classList.remove('dragging');
    draggableElements = dragging_from_list.getElementsByClassName("sortable-item");
    for(var i=0;i<draggableElements.length;i++){
        draggableElements[i].classList.remove('over');
      
    }
    //will modify code here that if we are dragging pubs column etc
    // .
     if(dragging_from_list == document.getElementById("publications")){
        getrevisedorderpubs(dragging_from_list);
    }
    

    if(dragging_from_list == document.getElementById("skills")){
        getrevisedorderskills(dragging_from_list);
    }

    if(dragging_from_list == document.getElementById("projects")){
        getrevisedorderprojects(dragging_from_list);
    }
    
     if(dragging_from_list == document.getElementById("education")){
        getrevisedordereducations(dragging_from_list);
    }

    if(dragging_from_list == document.getElementById("pages")){
        getrevisedorderpages(dragging_from_list);
    }
    
       if(dragging_from_list == document.getElementById("writings")){
        getrevisedorderwritings(dragging_from_list);
    }
    
    
    
    draggingitem = null;
    dragging_from_list = null;

    
}


function getrevisedorderpubs(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var doi = items[i].dataset.doi;  // assuming you used data-doi="{{ pub.doi }}"
    order.push({ doi: doi, position: i });
}
document.getElementById("ordered_ids_pubs").value = JSON.stringify(order)
console.log(order);
}


function getrevisedorderskills(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var id = items[i].dataset.id;  // assuming you used data-doi="{{ pub.doi }}"
    order.push({ id: id, position: i });
}
document.getElementById("ordered_ids_skills").value = JSON.stringify(order)
console.log(order);
}


function getrevisedordereducations(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var id = items[i].dataset.id;  // assuming you used data-doi="{{ pub.doi }}"
    order.push({ id: id, position: i });
}
document.getElementById("ordered_ids_educations").value = JSON.stringify(order)
console.log(order);
}



function getrevisedorderprojects(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var id = items[i].dataset.id;  // assuming you used data-doi="{{ pub.doi }}"
    order.push({ id: id, position: i });
}
document.getElementById("ordered_ids_projects").value = JSON.stringify(order)
console.log(order);
}

function getrevisedorderpages(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var id = items[i].dataset.id;  
    order.push({ id: id, position: i });
}
document.getElementById("ordered_ids_pages").value = JSON.stringify(order)
console.log(order);
}


function getrevisedorderwritings(container){
items = container.getElementsByClassName("sortable-item");
order = [];
for(var i=0;i<items.length;i++){
    var id = items[i].dataset.id;  
    order.push({ id: id, position: i });
}
document.getElementById("ordered_ids_writings").value = JSON.stringify(order)
console.log(order);
}




for(var i=0;i<list.length;i++){

        list[i].addEventListener('dragover', dragover); 

        var items = list[i].getElementsByClassName('sortable-item');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('dragstart', dragstart); 
            items[j].addEventListener('dragend', dragend);
        }
        

}