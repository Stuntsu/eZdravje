
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}


function dodajNovega(){
    var text = $("#imepriimek").val();
    var ime = text.substring(0, text.indexOf(' '));
    text = text.substring(text.indexOf(' ') + 1);
    var priimek = text;
    var datumrojstva = $("#datumrojstva").val();
    var sessionId = getSessionId();
    
    //nekaj ni podano:
    
    if(!ime || !priimek || !datumrojstva){
        $("#dodajNovegaSporocilo").html("<span class='obvestilo label " + "label-warning fade-in'>Prosim vnesite vse podatke!</span>");
    }
    else{
        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumrojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#dodajNovegaSporocilo").html("<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno dodan EHR '" +
                          ehrId + "'.</span>");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#dodajNovegaSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
        
    }
    
}
function preberiEHRid(){
    var ehrid = $("#ehrid").val();
    var sessionId = getSessionId();
    
    if(!ehrid){
        $("#preberisporocilo").html("<span class='obvestilo label " + "label-warning fade-in'>Prosimo preverite vnešeni EHR ID!</span>")
    }
    
    else{
        $.ajax({
			
			url: baseUrl + "/demographics/ehr/" + ehrid + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberisporocilo").html("<span class='obvestilo label " +
          "label-success fade-in'>Podatki prebrani! Bolnik je '" + party.firstNames + " " +
          party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
          "'.</span>");
			},
			error: function(err) {
				$("#preberisporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
    }
}
