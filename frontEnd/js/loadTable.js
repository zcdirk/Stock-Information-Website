/**
 * Created by zcdirk on 9/12/17.
 */
const EDUCATION = document.querySelector("#education table tbody");
const PROJECTS = document.querySelector("#projects table tbody");
const SKILLS_LEFT = document.querySelector("#skills .row .col-md-3");
const SKILLS_RIGHT = document.querySelector("#skills .row .col-md-9");
const PUBLICATIONS = document.querySelector("#publications ol");

const CONTENT = {
    "Education": [
        { "date": "Jan.2017 - Dec.2018", "school": "University of Southern California<br>(GPA:4.0/4.0)",
            "major": "M.S. in Electrical Engineering",
            "courses": "Introduction to Computer Networks<br>Probability<br>Computer Systems"},
        { "date": "Dec.2015 - May.2016", "school": "Carnegie Mellon University",
            "major": "Graduation Project in Computer Science Departmen"},
        { "date": "Sep.2012 - Jul.2016", "school": "Tianjin University<br>(GPA:3.47/4.0)",
            "major": "B.E. in Electronic Information Engineering<br>B.S. in Computer Science (Double Degree)",
            "courses": "Data Structure and Algorithm,<br> Operating System, Database,<br> C++, Visual C++ Programming"}
    ],
    "Projects" : [
        { "name": "O2: A music communication protocol(C Language)<br><br>Dec.2015 - May.2016",
            "description": ["Implemented O2, a new communication protocol for computer music under the instruction of Roger B. Dannenberg, Carnegie Mellon University.",
                "Solved problems of interconnection in local area networks, messages delivery, and clock synchronization.",
                "Used technology of socket programming (TCP and UDP), hash table, tree structure and broadcast method.",
                "O2 (about 15 us per message) has a better performance than OSC (about 17.5 us per message).",
                "Github directory: <a href='https://github.com/rbdannenberg/o2'>https://github.com/rbdannenberg/o2"]},
        { "name": "Intelligent Robotic Arm (C Language)<br><br>Sep.2014 - Jun.2015",
            "description": ["Wrote a program to control the robotic arm to catch and move the object on the table.",
                "The program included camera control, image recognition and arm operation.",
                "Finished more than 80% of the code."]},
        { "name": "Music Composing System Based on Leap Motion(C++)<br><br>Jun.2013 - Jun.2014",
            "description": ["Finished the program as the leader and learned about the interaction device and how to develop a software.",
                "Wrote a paper about the algorithm of Music Composition with Interaction Device."]},
        { "name": "Convolution Demo(Matlab)<br><br>Mar. 2013-Jun. 2013",
            "description": ["Self-taught to use Matlab, designed a Convolution Demo and presented it classmates and professor."]}
    ],
    "Skills" : [
        { "cate": "Programming Language",
            "content": "Java, C/C++, Javascript, Visual C, Matlab, SQL, VHDL, Assembly Language"},
        { "cate": "Frameworks",
            "content": "AngularJs, AngularJs2"},
        { "cate": "Softwares",
            "content": "Eclipse, Xcode, Visual Studio, WebStorm"}
    ],
    "Publications" : [
        { "link": "http://www-scf.usc.edu/~zhan468/public/assets/articles/A%20Music%20Performance%20Algorithm%20Based%20on%20Leap%20Motion%20and%20Piano%20Interface.pdf",
            "content": "Chi Z, Mingzhen F, Mingkun D, Di A, Qi J, Xin G. A Music Performance Algorithm Based on Leap Motion and Piano Interface[C]//International Conference on Frontiers of Manufacturing Science and Measuring Technology. 2015: 1193"},
        { "link": "http://www-scf.usc.edu/~zhan468/public/assets/articles/o2-web.pdf",
            "content": "Dannenberg R B, Chi Z. O2: Rethinking Open Sound Control[C]//Proceedings of the International Computer Music Conference. 2016: 494."}
    ]
};

(function generateTable() {
    // Education part
    let content = CONTENT;
    let edu = content.Education;
    let html = "";
    for (let i = 0; i < edu.length; i++) {
        html += "<tr>";
        html += "<td>" + edu[i].date + "</td>";
        html += "<td>" + edu[i].school + "</td>";
        html += "<td>" + edu[i].major + "</td>";
        if (edu[i].courses != undefined)
            html += "<td>" + edu[i].courses + "</td>";
        else
            html += "<td></td>";
        html += "</tr>";
    }
    EDUCATION.innerHTML += html;

    // Projects part
    let pro = content.Projects;
    html = "";
    for (let i = 0; i < pro.length; i++) {
        html += "<tr>";
        html += "<td>" + pro[i].name + "</td>";
        html += "<td><ul>"
        let des = pro[i].description;
        for (let j = 0; j < des.length; j++) {
            html += "<li>" + des[j]  + "</li>";
        }
        html += "</ul></td>";
        html += "</tr>";
    }
    PROJECTS.innerHTML += html;

    // Skills part
    let skill = content.Skills;
    let left = "", right = "";
    for (let i = 0; i < skill.length; i++) {
        left += "<b>" + skill[i].cate + ":</b><br>";
        right += skill[i].content + "<br>"
    }
    SKILLS_LEFT.innerHTML += left;
    SKILLS_RIGHT.innerHTML += right;

    // publication part
    let pub = content.Publications;
    html = "";
    for (let i = 0; i < pub.length; i++)
        html += "<li><a target='_blank' href='" + pub[i].link + "'>" + pub[i].content +"</a></li>"
    PUBLICATIONS.innerHTML += html;
})();
