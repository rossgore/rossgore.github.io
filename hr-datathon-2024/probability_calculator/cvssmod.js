/* Copyright (c) 2015-2019, Chandan B.N.
 *
 * Copyright (c) 2019, FIRST.ORG, INC
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 *    disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 *    following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
 *    products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*

CVSSjs Version 0.1 beta

Usage:
    craete an html element with an id for eg.,
    <div id="cvssboard"></div>

    // create a new instance of CVSS calculator:
    var c = new CVSS("cvssboard");

    // create a new instance of CVSS calculator with some event handler callbacks
    var c = new CVSS("cvssboard", {
                onchange: function() {....} //optional
                onsubmit: function() {....} //optional
                }

    // set a vector
    c.set('AV:L/AC:L/PR:N/UI:N/S:C/C:N/I:N/A:L');

    //get the value
    c.get() returns an object like:

    {
        score: 4.3,
        vector: 'AV:L/AC:L/PR:N/UI:N/S:C/C:N/I:N/A:L'
    }

*/

var CVSS = function (id, options) {
    this.options = options;
    this.wId = id;
    var e = function (tag) {
        return document.createElement(tag);
    };

    // Base Group
    this.bg = {
        AV: 'Attack Vector',
        AC: 'Attack Complexity',
        PR: 'Privileges Required',
        UI: 'User Interaction',
        S: 'Scope'//,
        //C: 'Confidentiality',
        //I: 'Integrity',
        //A: 'Availability'
    };

    // Base Metrics
    this.bm = {
        AV: {
            N: {
                l: 'Network',
                d: "<b>Worst:</b> The vulnerable component is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed 'remotely exploitable' and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers)."
            },
            A: {
                l: 'Adjacent',
                d: "<b>Worse:</b> The vulnerable component is bound to the network stack, but the attack is limited at the protocol level to a logically adjacent topology. This can mean an attack must be launched from the same shared physical (e.g., Bluetooth or IEEE 802.11) or logical (e.g., local IP subnet) network, or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN to an administrative network zone). One example of an Adjacent attack would be an ARP (IPv4) or neighbor discovery (IPv6) flood leading to a denial of service on the local LAN segment."
            },
            L: {
                l: 'Local',
                d: "<b>Bad:</b> The vulnerable component is not bound to the network stack and the attacker's path is via read/write/execute capabilities. Either: <ul><li>the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH);</li><li>or the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).</li></ul>"
            },
            P: {
                l: 'Physical',
                d: "<b>Bad:</b> The attack requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief (e.g., evil maid attack) or persistent. An example of such an attack is a cold boot attack in which an attacker gains access to disk encryption keys after physically accessing the target system. Other examples include peripheral attacks via FireWire/USB Direct Memory Access (DMA)."
            }
        },
        AC: {
            L: {
                l: 'Low',
                d: "<b>Worst:</b> Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success when attacking the vulnerable component."
            },
            H: {
                l: 'High',
                d: "<b>Bad:</b> A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected."
            }
        },
        PR: {
            N: {
                l: 'None',
                d: "<b>Worst:</b> The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files of the the vulnerable system to carry out an attack."
            },
            L: {
                l: 'Low',
                d: "<b>Worse</b> The attacker requires privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources."
            },
            H: {
                l: 'High',
                d: "<b>Bad:</b> The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable component allowing access to component-wide settings and files."
            }
        },
        UI: {
            N: {
                l: 'None',
                d: "<b>Worst:</b> The vulnerable system can be exploited without interaction from any user."
            },
            R: {
                l: 'Required',
                d: "<b>Bad:</b> Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited. For example, a successful exploit may only be possible during the installation of an application by a system administrator."
            }
        },

        S: {
            C: {
                l: 'Changed',
                d: "<b>Worst:</b> An exploited vulnerability can affect resources beyond the security scope managed by the security authority of the vulnerable component. In this case, the vulnerable component and the impacted component are different and managed by different security authorities."
            },
            U: {
                l: 'Unchanged',
                d: "<b>Bad:</b> An exploited vulnerability can only affect resources managed by the same security authority. In this case, the vulnerable component and the impacted component are either the same, or both are managed by the same security authority."
            }
        }
    };

    this.bme = {};
    this.bmgReg = {
        AV: 'NALP',
        AC: 'LH',
        PR: 'NLH',
        UI: 'NR',
        S: 'CU'
    };
    this.bmoReg = {
        AV: 'NALP',
        AC: 'LH',
        C: 'C',
        I: 'C',
        A: 'C'
    };
    var s, f, dl, g, dd, l;
    this.el = document.getElementById(id);
    this.el.appendChild(s = e('style'));
    s.innerHTML = '';
    this.el.appendChild(f = e('form'));
    f.className = 'cvssjs';
    this.calc = f;
    for (g in this.bg) {
        f.appendChild(dl = e('dl'));
        dl.setAttribute('class', g);
        var dt = e('dt');
        dt.innerHTML = this.bg[g];
        dl.appendChild(dt);
        for (s in this.bm[g]) {
            dd = e('dd');
            dl.appendChild(dd);
            var inp = e('input');
            inp.setAttribute('name', g);
            inp.setAttribute('value', s);
            inp.setAttribute('id', id + g + s);
            inp.setAttribute('class', g + s);
            //inp.setAttribute('ontouchstart', '');
            inp.setAttribute('type', 'radio');
            this.bme[g + s] = inp;
            var me = this;
            inp.onchange = function () {
                me.setMetric(this);
            };
            dd.appendChild(inp);
            l = e('label');
            dd.appendChild(l);
            l.setAttribute('for', id + g + s);
            l.appendChild(e('i')).setAttribute('class', g + s);
            l.appendChild(document.createTextNode(this.bm[g][s].l + ' '));
            dd.appendChild(e('small')).innerHTML = this.bm[g][s].d;
        }
    }
    //f.appendChild(e('hr'));
    f.appendChild(dl = e('dl'));
    dl.innerHTML = '<dt>Risk Level&sdot;Average Success Rate&sdot;CVSS Vector</dt>';
    dd = e('dd');
    dl.appendChild(dd);
    l = dd.appendChild(e('label'));
    l.className = 'results';
    l.appendChild(this.risk = e('span'));
    this.risk.className = 'risk';
    l.appendChild(this.score = e('span'));
    this.score.className = 'score';
    // setup the copy button/icon
    l.appendChild(document.createTextNode(' '));
    l.appendChild(this.copyButton = e('a'))
    this.copyButton.style.visibility = "hidden"
    this.copyButton.className = "copy-button"
    this.copyButton.title = "Copy Success Rate to Clipboard"
    this.copyButton.innerHTML = 'Copy'
    this.copyButton.onclick = function () {
        navigator.clipboard.writeText(document.querySelector(".score").innerText)
    }
    l.appendChild(document.createTextNode(' '));
    l.appendChild(this.vector = e('a'));
    this.vector.className = 'vector';
	this.vector.innerHTML = 'CVSS:3.1/AV:_/AC:_/PR:_/UI:_/S:_';
    if (options.onsubmit) {
        f.appendChild(e('hr'));
        this.submitButton = f.appendChild(e('input'));
        this.submitButton.setAttribute('type', 'submit');
        this.submitButton.onclick = options.onsubmit;
    }
};

CVSS.prototype.riskRatings = [{
    name: "None",
    bottom: 0.0,
    top: 0.0
}, {
    name: "Low",
    bottom: 0.1,
    top: 0.39
}, {
    name: "Medium",
    bottom: 0.4,
    top: 0.69
}, {
    name: "High",
    bottom: 0.7,
    top: 0.89
}, {
    name: "Critical",
    bottom: 0.9,
    top: 1.0
}];

CVSS.prototype.riskRating = function (score) {
    var i;
    var riskRatingLength = this.riskRatings.length;
    for (i = 0; i < riskRatingLength; i++) {
        if (score >= this.riskRatings[i].bottom && score <= this.riskRatings[i].top) {
            return this.riskRatings[i];
        }
    }
    return {
        name: "?",
        bottom: 'Not',
        top: 'defined'
    };
};

CVSS.prototype.valueofradio = function(e) {
    for(var i = 0; i < e.length; i++) {
        if (e[i].checked) {
            return e[i].value;
        }
    }
    return null;
};

CVSS.prototype.getArray = function(){
    var cvssVersion = "3.1";
	
    // Define associative arrays mapping each metric value to the constant used in the CVSS scoring formula.
    var Weight = {
        AV: {
            N: 0.85,
            A: 0.62,
            L: 0.55,
            P: 0.2
        },
        AC: {
            H: 0.44,
            L: 0.77
        },
        PR: {
            U: {
                N: 0.85,
                L: 0.62,
                H: 0.27
            },
            // These values are used if Scope is Unchanged
            C: {
                N: 0.85,
                L: 0.68,
                H: 0.5
            }
        },
        // These values are used if Scope is Changed
        UI: {
            N: 0.85,
            R: 0.62
        },
        S: {
            U: 6.42,
            C: 7.52
        }
    };
	
    var p;
    var val = {}, metricWeight = {};
    try {
        for (p in this.bg) {
            val[p] = this.valueofradio(this.calc.elements[p]);
            if (typeof val[p] === "undefined" || val[p] === null) {
                return "?";
            }
            metricWeight[p] = Weight[p][val[p]];
        }
    } catch (err) {
        return err; // TODO: need to catch and return sensible error value & do a better job of specifying *which* parm is at fault.
    }
	metricWeight.PR = Weight.PR[val.S][val.PR];
	
	const vals = [metricWeight.AV, metricWeight.AC, metricWeight.UI, metricWeight.PR];
	return vals;
	
}
CVSS.prototype.calculate = function () {
    var cvssVersion = "3.1";
	
    // Define associative arrays mapping each metric value to the constant used in the CVSS scoring formula.
    var Weight = {
        AV: {
            N: 0.85,
            A: 0.62,
            L: 0.55,
            P: 0.2
        },
        AC: {
            H: 0.44,
            L: 0.77
        },
        PR: {
            U: {
                N: 0.85,
                L: 0.62,
                H: 0.27
            },
            // These values are used if Scope is Unchanged
            C: {
                N: 0.85,
                L: 0.68,
                H: 0.5
            }
        },
        // These values are used if Scope is Changed
        UI: {
            N: 0.85,
            R: 0.62
        },
        S: {
            U: 6.42,
            C: 7.52
        }
    };
	
    var p;
    var val = {}, metricWeight = {};
    try {
        for (p in this.bg) {
            val[p] = this.valueofradio(this.calc.elements[p]);
            if (typeof val[p] === "undefined" || val[p] === null) {
                return "?";
            }
            metricWeight[p] = Weight[p][val[p]];
        }
    } catch (err) {
        return err; // TODO: need to catch and return sensible error value & do a better job of specifying *which* parm is at fault.
    }
	metricWeight.PR = Weight.PR[val.S][val.PR];
	var total_vals = metricWeight.AV + metricWeight.AC + metricWeight.UI+metricWeight.PR;
    var roundUp1 = function Roundup(input) {
        var int_input = input.toFixed(2)
		return int_input
    };
	
	return roundUp1(total_vals/4);
}

CVSS.prototype.get = function() {
    return {
        score: this.score.innerHTML,
        vector: this.vector.innerHTML
    };
};

CVSS.prototype.setMetric = function(a) {
    var vectorString = this.vector.innerHTML;
    //if (/AV:.\/AC:.\/PR:.\/UI:.\/S:.\/C:.\/I:.\/A:./.test(vectorString)) {}
	if (/AV:.\/AC:.\/PR:.\/UI:.\/S:/.test(vectorString)) {}
	 else {
        //vectorString = 'AV:_/AC:_/PR:_/UI:_/S:_/C:_/I:_/A:_';
		vectorString = 'AV:_/AC:_/PR:_/UI:_/S:_';
    }
    //e("E" + a.id).checked = true;
    var newVec = vectorString.replace(new RegExp('\\b' + a.name + ':.'), a.name + ':' + a.value);
    this.set(newVec);
};

CVSS.prototype.set = function(vec) {
    var newVec = 'CVSS:3.1/';
    var sep = '';
    for (var m in this.bm) {
        var match = (new RegExp('\\b(' + m + ':[' + this.bmgReg[m] + '])')).exec(vec);
        if (match !== null) {
            var check = match[0].replace(':', '');
            this.bme[check].checked = true;
            newVec = newVec + sep + match[0];
        } else if ((m in {C:'', I:'', A:''}) && (match = (new RegExp('\\b(' + m + ':C)')).exec(vec)) !== null) {
            // compatibility with v2 only for CIA:C
            this.bme[m + 'H'].checked = true;
            newVec = newVec + sep + m + ':H';
        } else {
            newVec = newVec + sep + m + ':_';
            for (var j in this.bm[m]) {
                this.bme[m + j].checked = false;
            }
        }
        sep = '/';
    }
    this.update(newVec);
};

CVSS.prototype.update = function(newVec) {
    this.vector.innerHTML = newVec;
    var s = this.calculate();
	var x = this.getArray();
    this.score.innerHTML = '  '+(s) + ' ';
    var rating = this.riskRating(s);
    this.risk.className = rating.name + ' risk ';
    this.risk.innerHTML = rating.name + '<sub>' + rating.bottom + ' - ' + rating.top + '</sub>';
    this.risk.title = rating.bottom + ' - ' + rating.top;
    if (rating['name'] != '?') {
        this.copyButton.style.visibility = "visible"
    }
    if (this.options !== undefined && this.options.onchange !== undefined) {
        this.options.onchange();
    }
	// histogram stuff
	var trace = {
	    x: x,
	    type: 'histogram',
		xbins: {
		    size: 0.1, 
		  }
	  };
	var data = [trace];
	var layout = {
	  title: 'Histogram of Success Rates for an Attacker Whose Techniques Target This Type of Vulnerability',
	  plot_bgcolor:"#f7f7f4",
	  paper_bgcolor: "#f7f7f4",
	  xaxis: {
		title: {
		            text: "Rate of Success for an Attacker"
		},
	    autotick: false,
	    ticks: 'outside',
	    tickcolor: '#000',
		tick0: 0,
    	dtick: 0.1,
    	ticklen: 8,
    	tickwidth: 4,
		range: [0, 1] 
	  },
	  yaxis: {
  		title: {
  		            text: "Count"
  		},
	    autotick: false,
	    ticks: 'outside',
	    tick0: 0,
	    dtick: 1,
	    ticklen: 8,
	    tickwidth: 4,
	    tickcolor: '#000',
		range: [0, 4] 
	  }
	};
	Plotly.newPlot('myDiv', data, layout);
};