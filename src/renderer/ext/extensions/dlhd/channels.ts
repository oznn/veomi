const channels = [
  {
    title: 'ABC USA',
    id: '51',
  },
  {
    title: 'A&E USA',
    id: '302',
  },
  {
    title: 'AMC USA',
    id: '303',
  },
  {
    title: 'Animal Planet',
    id: '304',
  },
  {
    title: 'ACC Network USA',
    id: '666',
  },
  {
    title: 'Astro SuperSport 1',
    id: '123',
  },
  {
    title: 'Astro SuperSport 2',
    id: '124',
  },
  {
    title: 'Astro SuperSport 3',
    id: '125',
  },
  {
    title: 'Astro SuperSport 4',
    id: '126',
  },
  {
    title: 'Arena Sport 1 Premium',
    id: '134',
  },
  {
    title: 'Arena Sport 2 Premium',
    id: '135',
  },
  {
    title: 'Arena Sport 3 Premium',
    id: '139',
  },
  {
    title: 'Arena Sport 1 Serbia',
    id: '429',
  },
  {
    title: 'Arena Sport 2 Serbia',
    id: '430',
  },
  {
    title: 'Arena Sport 3 Serbia',
    id: '431',
  },
  {
    title: 'Arena Sport 4 Serbia',
    id: '581',
  },
  {
    title: 'Arena Sport 1 Croatia',
    id: '432',
  },
  {
    title: 'Arena Sport 2 Croatia',
    id: '433',
  },
  {
    title: 'Arena Sport 3 Croatia',
    id: '434',
  },
  {
    title: 'Arena Sport 4 Croatia',
    id: '580',
  },
  {
    title: 'Alkass One',
    id: '781',
  },
  {
    title: 'Alkass Two',
    id: '782',
  },
  {
    title: 'Alkass Three',
    id: '783',
  },
  {
    title: 'Alkass Four',
    id: '784',
  },
  {
    title: 'ABS-CBN',
    id: '785',
  },
  {
    title: 'Arena Sport 1 BiH',
    id: '579',
  },
  {
    title: 'Abu Dhabi Sports 1 UAE',
    id: '600',
  },
  {
    title: 'Abu Dhabi Sports 2 UAE',
    id: '601',
  },
  {
    title: 'Abu Dhabi Sports 1 Premium',
    id: '609',
  },
  {
    title: 'Abu Dhabi Sports 2 Premium',
    id: '610',
  },
  {
    title: 'Astro Cricket',
    id: '370',
  },
  {
    title: 'Antena 3 Spain',
    id: '531',
  },
  {
    title: 'ACC Network USA',
    id: '664',
  },
  {
    title: 'Adult Swim',
    id: '295',
  },
  {
    title: 'AXN Movies Portugal',
    id: '717',
  },
  {
    title: 'Arte DE',
    id: '725',
  },
  {
    title: 'AXS TV USA',
    id: '742',
  },
  {
    title: 'ABCNY USA',
    id: '766',
  },
  {
    title: 'beIN Sports MENA English 1',
    id: '61',
  },
  {
    title: 'beIN Sports MENA English 2',
    id: '90',
  },
  {
    title: 'beIN Sports MENA English 3',
    id: '46',
  },
  {
    title: 'beIN Sports MENA 1',
    id: '91',
  },
  {
    title: 'beIN Sports MENA 2',
    id: '92',
  },
  {
    title: 'beIN Sports MENA 3',
    id: '93',
  },
  {
    title: 'beIN Sports MENA 4',
    id: '94',
  },
  {
    title: 'beIN Sports MENA 5',
    id: '95',
  },
  {
    title: 'beIN Sports MENA 6',
    id: '96',
  },
  {
    title: 'beIN Sports MENA 7',
    id: '97',
  },
  {
    title: 'beIN Sports MENA Premium 1',
    id: '98',
  },
  {
    title: 'beIN Sports MENA Premium 2',
    id: '99',
  },
  {
    title: 'beIN Sports MENA Premium 3',
    id: '100',
  },
  {
    title: 'beIN Sports MAX 4 France',
    id: '494',
  },
  {
    title: 'beIN Sports MAX 5 France',
    id: '495',
  },
  {
    title: 'beIN Sports MAX 6 France',
    id: '496',
  },
  {
    title: 'beIN Sports MAX 7 France',
    id: '497',
  },
  {
    title: 'beIN Sports MAX 8 France',
    id: '498',
  },
  {
    title: 'beIN Sports MAX 9 France',
    id: '499',
  },
  {
    title: 'beIN Sports MAX 10 France',
    id: '500',
  },
  {
    title: 'beIN SPORTS 1 France',
    id: '116',
  },
  {
    title: 'beIN SPORTS 2 France',
    id: '117',
  },
  {
    title: 'beIN SPORTS 3 France',
    id: '118',
  },
  {
    title: 'beIN SPORTS 1 Turkey',
    id: '62',
  },
  {
    title: 'beIN SPORTS 2 Turkey',
    id: '63',
  },
  {
    title: 'beIN SPORTS 3 Turkey',
    id: '64',
  },
  {
    title: 'beIN SPORTS 4 Turkey',
    id: '67',
  },
  {
    title: 'BeIN Sports HD Qatar',
    id: '578',
  },
  {
    title: 'BeIN SPORTS USA',
    id: '425',
  },
  {
    title: 'beIN SPORTS en Espa単ol',
    id: '372',
  },
  {
    title: 'beIN SPORTS Australia 1',
    id: '491',
  },
  {
    title: 'beIN SPORTS Australia 2',
    id: '492',
  },
  {
    title: 'beIN SPORTS Australia 3',
    id: '493',
  },
  {
    title: 'Barca TV Spain',
    id: '522',
  },
  {
    title: 'Benfica TV PT',
    id: '380',
  },
  {
    title: 'Boomerang',
    id: '648',
  },
  {
    title: 'BNT 1 Bulgaria',
    id: '476',
  },
  {
    title: 'BNT 2 Bulgaria',
    id: '477',
  },
  {
    title: 'BNT 3 Bulgaria',
    id: '478',
  },
  {
    title: 'BR Fernsehen DE',
    id: '737',
  },
  {
    title: 'bTV Bulgaria',
    id: '479',
  },
  {
    title: 'bTV Action Bulgaria',
    id: '481',
  },
  {
    title: 'bTV Lady Bulgaria',
    id: '484',
  },
  {
    title: 'BBC America (BBCA)',
    id: '305',
  },
  {
    title: 'BET USA',
    id: '306',
  },
  {
    title: 'Bravo USA',
    id: '307',
  },
  {
    title: 'BBC News Channel HD',
    id: '349',
  },
  {
    title: 'BBC One UK',
    id: '356',
  },
  {
    title: 'BBC Two UK',
    id: '357',
  },
  {
    title: 'BBC Three UK',
    id: '358',
  },
  {
    title: 'BBC Four UK',
    id: '359',
  },
  {
    title: 'BIG TEN Network (BTN USA)',
    id: '397',
  },
  {
    title: 'Cuatro Spain',
    id: '535',
  },
  {
    title: 'Channel 4 UK',
    id: '354',
  },
  {
    title: 'Channel 5 UK',
    id: '355',
  },
  {
    title: 'CBS Sports Network (CBSSN)',
    id: '308',
  },
  {
    title: 'Canal+ France',
    id: '121',
  },
  {
    title: 'Canal+ Sport France',
    id: '122',
  },
  {
    title: 'Canal+ Foot France',
    id: '463',
  },
  {
    title: 'Canal+ Sport360',
    id: '464',
  },
  {
    title: 'Canal 11 Portugal',
    id: '540',
  },
  {
    title: 'Canal+ Sport Poland',
    id: '48',
  },
  {
    title: 'Canal+ Sport 2 Poland',
    id: '73',
  },
  {
    title: 'CANAL+ SPORT 5 Poland',
    id: '75',
  },
  {
    title: 'Canal+ Premium Poland',
    id: '566',
  },
  {
    title: 'Canal+ Family Poland',
    id: '567',
  },
  {
    title: 'Canal+ Seriale Poland',
    id: '570',
  },
  {
    title: 'Canal+ Sport 1 Afrique',
    id: '486',
  },
  {
    title: 'Canal+ Sport 2 Afrique',
    id: '487',
  },
  {
    title: 'Canal+ Sport 3 Afrique',
    id: '488',
  },
  {
    title: 'Canal+ Sport 4 Afrique',
    id: '489',
  },
  {
    title: 'Canal+ Sport 5 Afrique',
    id: '490',
  },
  {
    title: 'CANAL9 Denmark',
    id: '805',
  },
  {
    title: 'Combate Brasil',
    id: '89',
  },
  {
    title: 'C More Football Sweden',
    id: '747',
  },
  {
    title: 'Cosmote Sport 1 HD',
    id: '622',
  },
  {
    title: 'Cosmote Sport 2 HD',
    id: '623',
  },
  {
    title: 'Cosmote Sport 3 HD',
    id: '624',
  },
  {
    title: 'Cosmote Sport 4 HD',
    id: '625',
  },
  {
    title: 'Cosmote Sport 5 HD',
    id: '626',
  },
  {
    title: 'Cosmote Sport 6 HD',
    id: '627',
  },
  {
    title: 'Cosmote Sport 7 HD',
    id: '628',
  },
  {
    title: 'Cosmote Sport 8 HD',
    id: '629',
  },
  {
    title: 'Cosmote Sport 9 HD',
    id: '630',
  },
  {
    title: 'Channel 9 Israel',
    id: '546',
  },
  {
    title: 'Channel 10 Israe',
    id: '547',
  },
  {
    title: 'Channel 11 Israel',
    id: '548',
  },
  {
    title: 'Channel 12 Israel',
    id: '549',
  },
  {
    title: 'Channel 13 Israel',
    id: '551',
  },
  {
    title: 'Channel 14 Israel',
    id: '552',
  },
  {
    title: 'C More Stars Sweden',
    id: '8111',
  },
  {
    title: 'C More First Sweden',
    id: '812',
  },
  {
    title: 'C More Hits Sweden',
    id: '813',
  },
  {
    title: 'C More Series Sweden',
    id: '814',
  },
  {
    title: 'COZI TV USA',
    id: '748',
  },
  {
    title: 'CMT USA',
    id: '647',
  },
  {
    title: 'CBS USA',
    id: '52',
  },
  {
    title: 'CW USA',
    id: '300',
  },
  {
    title: 'CNBC USA',
    id: '309',
  },
  {
    title: 'Comedy Central',
    id: '310',
  },
  {
    title: 'Cartoon Network',
    id: '339',
  },
  {
    title: 'CNN USA',
    id: '345',
  },
  {
    title: 'Cinemax USA',
    id: '374',
  },
  {
    title: 'CTV Canada',
    id: '602',
  },
  {
    title: 'CTV 2 Canada',
    id: '838',
  },
  {
    title: 'Crime+ Investigation USA',
    id: '669',
  },
  {
    title: 'Comet USA',
    id: '696',
  },
  {
    title: 'Cooking Channel USA',
    id: '697',
  },
  {
    title: 'Cleo TV',
    id: '715',
  },
  {
    title: 'C SPAN 1',
    id: '750',
  },
  {
    title: 'CBSNY USA',
    id: '767',
  },
  {
    title: 'Citytv',
    id: '831',
  },
  {
    title: 'CBC CA',
    id: '832',
  },
  {
    title: 'DAZN 1 Bar DE',
    id: '426',
  },
  {
    title: 'DAZN 2 Bar DE',
    id: '427',
  },
  {
    title: 'DAZN 1 Spain',
    id: '445',
  },
  {
    title: 'DAZN 2 Spain',
    id: '446',
  },
  {
    title: 'DAZN 3 Spain',
    id: '447',
  },
  {
    title: 'DAZN 4 Spain',
    id: '448',
  },
  {
    title: 'DAZN F1 ES',
    id: '537',
  },
  {
    title: 'DAZN LaLiga',
    id: '538',
  },
  {
    title: 'DAZN LaLiga 2',
    id: '43',
  },
  {
    title: 'DR1 Denmark',
    id: '801',
  },
  {
    title: 'DR2 Denmark',
    id: '802',
  },
  {
    title: 'Digi Sport 1 Romania',
    id: '400',
  },
  {
    title: 'Digi Sport 2 Romania',
    id: '401',
  },
  {
    title: 'Digi Sport 3 Romania',
    id: '402',
  },
  {
    title: 'Digi Sport 4 Romania',
    id: '403',
  },
  {
    title: 'Diema Sport Bulgaria',
    id: '465',
  },
  {
    title: 'Diema Sport 2 Bulgaria',
    id: '466',
  },
  {
    title: 'Diema Sport 3 Bulgaria',
    id: '467',
  },
  {
    title: 'Diema Bulgaria',
    id: '482',
  },
  {
    title: 'Diema Family Bulgaria',
    id: '485',
  },
  {
    title: 'Dubai Sports 1 UAE',
    id: '604',
  },
  {
    title: 'Dubai Sports 2 UAE',
    id: '605',
  },
  {
    title: 'Dubai Sports 3 UAE',
    id: '606',
  },
  {
    title: 'Dubai Racing 1 UAE',
    id: '607',
  },
  {
    title: 'Dubai Racing 2 UAE',
    id: '608',
  },
  {
    title: 'DSTV Mzansi Magic',
    id: '786',
  },
  {
    title: 'DSTV M-Net',
    id: '827',
  },
  {
    title: 'DSTV kykNET & kie',
    id: '828',
  },
  {
    title: 'Discovery Life Channel',
    id: '311',
  },
  {
    title: 'Disney Channel',
    id: '312',
  },
  {
    title: 'Discovery Channel',
    id: '313',
  },
  {
    title: 'Discovery Family',
    id: '657',
  },
  {
    title: 'Disney XD',
    id: '314',
  },
  {
    title: 'Destination America',
    id: '651',
  },
  {
    title: 'Disney JR',
    id: '652',
  },
  {
    title: 'Dave',
    id: '348',
  },
  {
    title: 'ESPN USA',
    id: '44',
  },
  {
    title: 'ESPN2 USA',
    id: '45',
  },
  {
    title: 'ESPNU USA',
    id: '316',
  },
  {
    title: 'ESPN 1 NL',
    id: '379',
  },
  {
    title: 'ESPN 2 NL',
    id: '386',
  },
  {
    title: 'Eleven Sports 1 Poland',
    id: '71',
  },
  {
    title: 'Eleven Sports 2 Poland',
    id: '72',
  },
  {
    title: 'Eleven Sports 3 Poland',
    id: '428',
  },
  {
    title: 'Eleven Sports 1 Portugal',
    id: '455',
  },
  {
    title: 'Eleven Sports 2 Portugal',
    id: '456',
  },
  {
    title: 'Eleven Sports 3 Portugal',
    id: '457',
  },
  {
    title: 'Eleven Sports 4 Portugal',
    id: '458',
  },
  {
    title: 'Eleven Sports 5 Portugal',
    id: '459',
  },
  {
    title: 'EuroSport 1 UK',
    id: '41',
  },
  {
    title: 'EuroSport 2 UK',
    id: '42',
  },
  {
    title: 'EuroSport 1 Poland',
    id: '57',
  },
  {
    title: 'EuroSport 2 Poland',
    id: '58',
  },
  {
    title: 'EuroSport 1 Spain',
    id: '524',
  },
  {
    title: 'EuroSport 2 Spain',
    id: '525',
  },
  {
    title: 'EuroSport 1 Italy',
    id: '878',
  },
  {
    title: 'EuroSport 2 Italy',
    id: '879',
  },
  {
    title: 'Eurosport 1 Bulgaria',
    id: '469',
  },
  {
    title: 'Eurosport 2 Bulgaria',
    id: '470',
  },
  {
    title: 'ESPN Premium Argentina',
    id: '387',
  },
  {
    title: 'ESPN Brasil',
    id: '81',
  },
  {
    title: 'ESPN2 Brasil',
    id: '82',
  },
  {
    title: 'ESPN3 Brasil',
    id: '83',
  },
  {
    title: 'ESPN4 Brasil',
    id: '85',
  },
  {
    title: 'ESPN SUR',
    id: '149',
  },
  {
    title: 'ESPN2 SUR',
    id: '150',
  },
  {
    title: 'ESPN Deportes',
    id: '375',
  },
  {
    title: 'ESPNews',
    id: '288',
  },
  {
    title: 'E! Entertainment Television',
    id: '315',
  },
  {
    title: 'E4 Channel',
    id: '363',
  },
  {
    title: 'Fox Sports 1 USA',
    id: '39',
  },
  {
    title: 'Fox Sports 2 USA',
    id: '758',
  },
  {
    title: 'FOX Soccer Plus',
    id: '756',
  },
  {
    title: 'Fox Cricket',
    id: '369',
  },
  {
    title: 'FOX Deportes USA',
    id: '643',
  },
  {
    title: 'FOX Sports 502 AU',
    id: '820',
  },
  {
    title: 'FOX Sports 503 AU',
    id: '821',
  },
  {
    title: 'FOX Sports 504 AU',
    id: '822',
  },
  {
    title: 'FOX Sports 505 AU',
    id: '823',
  },
  {
    title: 'FOX Sports 506 AU',
    id: '824',
  },
  {
    title: 'FOX Sports 507 AU',
    id: '825',
  },
  {
    title: 'Fox Sports Argentina',
    id: '767',
  },
  {
    title: 'Fox Sports 2 Argentina',
    id: '788',
  },
  {
    title: 'Fox Sports 3 Argentina',
    id: '789',
  },
  {
    title: 'Fox Sports Premium MX',
    id: '830',
  },
  {
    title: 'FilmBox Premium Poland',
    id: '568',
  },
  {
    title: 'Fight Network',
    id: '757',
  },
  {
    title: 'Fox Business',
    id: '297',
  },
  {
    title: 'FOX HD Bulgaria',
    id: '483',
  },
  {
    title: 'FOX USA',
    id: '54',
  },
  {
    title: 'FX USA',
    id: '317',
  },
  {
    title: 'FXX USA',
    id: '298',
  },
  {
    title: 'Freeform',
    id: '301',
  },
  {
    title: 'Fox News',
    id: '347',
  },
  {
    title: 'FX Movie Channel',
    id: '381',
  },
  {
    title: 'FYI',
    id: '665',
  },
  {
    title: 'Film4 UK',
    id: '688',
  },
  {
    title: 'Fashion TV',
    id: '744',
  },
  {
    title: 'FETV - Family Entertainment Television',
    id: '751',
  },
  {
    title: 'FOXNY USA',
    id: '768',
  },
  {
    title: 'Fox Weather Channel',
    id: '775',
  },
  {
    title: 'GOL PLAY Spain',
    id: '530',
  },
  {
    title: 'GOLF Channel USA',
    id: '318',
  },
  {
    title: 'Game Show Network',
    id: '319',
  },
  {
    title: 'Gol Mundial 1',
    id: '292',
  },
  {
    title: 'Gold UK',
    id: '687',
  },
  {
    title: 'Galavisi贸n USA',
    id: '743',
  },
  {
    title: 'CBC CA',
    id: '699',
  },
  {
    title: 'Grit Channel',
    id: '752',
  },
  {
    title: 'Globo SP',
    id: '760',
  },
  {
    title: 'Globo RIO',
    id: '761',
  },
  {
    title: 'Global CA',
    id: '836',
  },
  {
    title: 'The Hallmark Channel',
    id: '320',
  },
  {
    title: 'Hallmark Movies & Mysterie',
    id: '296',
  },
  {
    title: 'HBO USA',
    id: '321',
  },
  {
    title: 'HBO2 USA',
    id: '689',
  },
  {
    title: 'HBO Comedy USA',
    id: '690',
  },
  {
    title: 'HBO Family USA',
    id: '691',
  },
  {
    title: 'HBO Latino USA',
    id: '692',
  },
  {
    title: 'HBO Signature USA',
    id: '693',
  },
  {
    title: 'HBO Zone USA',
    id: '694',
  },
  {
    title: 'HBO Poland',
    id: '569',
  },
  {
    title: 'History USA',
    id: '322',
  },
  {
    title: 'Headline News',
    id: '323',
  },
  {
    title: 'HGTV',
    id: '382',
  },
  {
    title: 'HOT3 Israel',
    id: '553',
  },
  {
    title: 'HR Fernsehen DE',
    id: '740',
  },
  {
    title: 'ITV 1 UK',
    id: '350',
  },
  {
    title: 'ITV 2 UK',
    id: '351',
  },
  {
    title: 'ITV 3 UK',
    id: '352',
  },
  {
    title: 'ITV 4 UK',
    id: '353',
  },
  {
    title: 'Italia 1 Italy',
    id: '854',
  },
  {
    title: 'Investigation Discovery (ID USA)',
    id: '324',
  },
  {
    title: 'ION USA',
    id: '325',
  },
  {
    title: 'IFC TV USA',
    id: '656',
  },
  {
    title: 'Kanal 4 Denmark',
    id: '803',
  },
  {
    title: 'Kanal 5 Denmark',
    id: '804',
  },
  {
    title: 'Kabel Eins (Kabel 1) DE',
    id: '731',
  },
  {
    title: 'LaLiga SmartBank TV',
    id: '539',
  },
  {
    title: "L'Equipe France",
    id: '645',
  },
  {
    title: 'La Sexta Spain',
    id: '534',
  },
  {
    title: 'Liverpool TV (LFC TV)',
    id: '826',
  },
  {
    title: 'Lifetime Network',
    id: '326',
  },
  {
    title: 'Lifetime Movies Network',
    id: '389',
  },
  {
    title: 'Longhorn Network USA',
    id: '667',
  },
  {
    title: 'La7 Italy',
    id: '855',
  },
  {
    title: 'LA7d HD+ Italy',
    id: '856',
  },
  {
    title: 'Match Football 1 Russia',
    id: '136',
  },
  {
    title: 'Match Football 2 Russia',
    id: '137',
  },
  {
    title: 'Match Football 3 Russia',
    id: '138',
  },
  {
    title: 'Match Premier Russia',
    id: '573',
  },
  {
    title: 'Match TV Russia',
    id: '127',
  },
  {
    title: 'МАТЧ! БОЕЦ Russia',
    id: '395',
  },
  {
    title: 'Movistar Laliga',
    id: '84',
  },
  {
    title: 'Movistar Liga de Campeones',
    id: '435',
  },
  {
    title: 'Movistar Deportes Spain',
    id: '436',
  },
  {
    title: 'Movistar Deportes 2 Spain',
    id: '438',
  },
  {
    title: 'Movistar Deportes 3 Spain',
    id: '526',
  },
  {
    title: 'Movistar Deportes 4 Spain',
    id: '527',
  },
  {
    title: 'Movistar Golf Spain',
    id: '528',
  },
  {
    title: 'Motowizja Poland',
    id: '563',
  },
  {
    title: 'MSG USA',
    id: '765',
  },
  {
    title: 'MSNBC',
    id: '327',
  },
  {
    title: 'Magnolia Network',
    id: '299',
  },
  {
    title: 'MTV UK',
    id: '367',
  },
  {
    title: 'MTV USA',
    id: '371',
  },
  {
    title: 'MUTV UK',
    id: '377',
  },
  {
    title: 'MAVTV USA',
    id: '646',
  },
  {
    title: 'Max Sport 1 Croatia',
    id: '779',
  },
  {
    title: 'Max Sport 2 Croatia',
    id: '780',
  },
  {
    title: 'Marquee Sports Network',
    id: '770',
  },
  {
    title: 'Max Sport 1 Bulgaria',
    id: '472',
  },
  {
    title: 'Max Sport 2 Bulgaria',
    id: '473',
  },
  {
    title: 'Max Sport 3 Bulgaria',
    id: '474',
  },
  {
    title: 'Max Sport 4 Bulgaria',
    id: '475',
  },
  {
    title: 'MLB Network USA',
    id: '399',
  },
  {
    title: 'MASN USA',
    id: '829',
  },
  {
    title: 'MY9TV USA',
    id: '654',
  },
  {
    title: 'Motor Trend',
    id: '661',
  },
  {
    title: 'METV USA',
    id: '662',
  },
  {
    title: 'MDR DE',
    id: '733',
  },
  {
    title: 'Mundotoro TV Spain',
    id: '749',
  },
  {
    title: 'MTV Denmark',
    id: '806',
  },
  {
    title: 'NHL Network USA',
    id: '663',
  },
  {
    title: 'Nova Sport Bulgaria',
    id: '468',
  },
  {
    title: 'Nova Sport Serbia',
    id: '582',
  },
  {
    title: 'Nova Sports 1 Greece',
    id: '631',
  },
  {
    title: 'Nova Sports 2 Greece',
    id: '632',
  },
  {
    title: 'Nova Sports 3 Greece',
    id: '633',
  },
  {
    title: 'Nova Sports 4 Greece',
    id: '634',
  },
  {
    title: 'Nova Sports 5 Greece',
    id: '635',
  },
  {
    title: 'Nova Sports 6 Greece',
    id: '636',
  },
  {
    title: 'Nova Sports Premier League Greece',
    id: '599',
  },
  {
    title: 'Nova Sports Start Greece',
    id: '637',
  },
  {
    title: 'Nova Sports Prime Greece',
    id: '638',
  },
  {
    title: 'Nova Sports News Greece',
    id: '639',
  },
  {
    title: 'NESN USA',
    id: '762',
  },
  {
    title: 'NBC USA',
    id: '53',
  },
  {
    title: 'NBA TV USA',
    id: '404',
  },
  {
    title: 'NBC Sports Chicago',
    id: '776',
  },
  {
    title: 'NBC Sports Philadelphia',
    id: '777',
  },
  {
    title: 'NBC Sports Washington',
    id: '778',
  },
  {
    title: 'NFL Network',
    id: '405',
  },
  {
    title: 'NBC Sports Bay Area',
    id: '753',
  },
  {
    title: 'NBC Sports Boston',
    id: '754',
  },
  {
    title: 'NBC Sports California',
    id: '755',
  },
  {
    title: 'NBCNY USA',
    id: '769',
  },
  {
    title: 'Nova TV Bulgaria',
    id: '480',
  },
  {
    title: 'National Geographic (NGC)',
    id: '328',
  },
  {
    title: 'NICK JR',
    id: '329',
  },
  {
    title: 'NICK',
    id: '330',
  },
  {
    title: 'Nick Music',
    id: '666',
  },
  {
    title: 'Nicktoons',
    id: '649',
  },
  {
    title: 'NDR DE',
    id: '736',
  },
  {
    title: 'NewsNation USA',
    id: '292',
  },
  {
    title: 'Newsmax USA',
    id: '613',
  },
  {
    title: 'Nat Geo Wild USA',
    id: '745',
  },
  {
    title: 'Noovo CA',
    id: '835',
  },
  {
    title: 'New! CWPIX 11',
    id: '771',
  },
  {
    title: 'OnTime Sports',
    id: '611',
  },
  {
    title: 'OnTime Sports 2',
    id: '612',
  },
  {
    title: 'ONE 1 HD Israel',
    id: '541',
  },
  {
    title: 'ONE 2 HD Israel',
    id: '542',
  },
  {
    title: 'Orange Sport 1 Romania',
    id: '439',
  },
  {
    title: 'Orange Sport 2 Romania',
    id: '440',
  },
  {
    title: 'Orange Sport 3 Romania',
    id: '441',
  },
  {
    title: 'Orange Sport 4 Romania',
    id: '442',
  },
  {
    title: 'Oprah Winfrey Network (OWN)',
    id: '331',
  },
  {
    title: 'Oxygen True Crime',
    id: '332',
  },
  {
    title: 'Polsat Poland',
    id: '562',
  },
  {
    title: 'Polsat Sport Poland',
    id: '47',
  },
  {
    title: 'Polsat Sport Extra Poland',
    id: '50',
  },
  {
    title: 'Polsat Sport News Poland',
    id: '129',
  },
  {
    title: 'Polsat News Poland',
    id: '443',
  },
  {
    title: 'Polsat Film Poland',
    id: '564',
  },
  {
    title: 'Porto Canal Portugal',
    id: '718',
  },
  {
    title: 'ProSieben (PRO7) DE',
    id: '730',
  },
  {
    title: 'PTV Sports',
    id: '450',
  },
  {
    title: 'Premier Brasil',
    id: '88',
  },
  {
    title: 'Prima Sport 1',
    id: '583',
  },
  {
    title: 'Prima Sport 2',
    id: '584',
  },
  {
    title: 'Prima Sport 3',
    id: '585',
  },
  {
    title: 'Prima Sport 4',
    id: '586',
  },
  {
    title: 'Paramount Network',
    id: '334',
  },
  {
    title: 'POP TV USA',
    id: '653',
  },
  {
    title: 'RTE 1',
    id: '364',
  },
  {
    title: 'RTE 2',
    id: '365',
  },
  {
    title: 'RMC Sport 1 France',
    id: '119',
  },
  {
    title: 'RMC Sport 2 France',
    id: '120',
  },
  {
    title: 'RTP 1 Portugal',
    id: '719',
  },
  {
    title: 'RTP 2 Portugal',
    id: '720',
  },
  {
    title: 'RTP 3 Portugal',
    id: '721',
  },
  {
    title: 'Rai 1 Italy',
    id: '850',
  },
  {
    title: 'Rai 2 Italy',
    id: '851',
  },
  {
    title: 'Rai 3 Italy',
    id: '852',
  },
  {
    title: 'Rai 3 Italy',
    id: '853',
  },
  {
    title: 'Rai Sport Italy',
    id: '882',
  },
  {
    title: 'Rai Premium Italy',
    id: '858',
  },
  {
    title: 'Real Madrid TV Spain',
    id: '523',
  },
  {
    title: 'RDS CA',
    id: '839',
  },
  {
    title: 'RDS 2 CA',
    id: '840',
  },
  {
    title: 'RDS Info CA',
    id: '841',
  },
  {
    title: 'Ring Bulgaria',
    id: '471',
  },
  {
    title: 'RTL7 Netherland',
    id: '390',
  },
  {
    title: 'Racing Tv UK',
    id: '555',
  },
  {
    title: 'Reelz Channel',
    id: '293',
  },
  {
    title: 'Sky Sports Football UK',
    id: '35',
  },
  {
    title: 'Sky Sports Arena UK',
    id: '36',
  },
  {
    title: 'Sky Sports Action UK',
    id: '37',
  },
  {
    title: 'Sky Sports Main Event',
    id: '38',
  },
  {
    title: 'Sky sports Premier League',
    id: '130',
  },
  {
    title: 'Sky Sports F1 UK',
    id: '60',
  },
  {
    title: 'Sky Sports Cricket',
    id: '65',
  },
  {
    title: 'Sky Sports Golf UK',
    id: '70',
  },
  {
    title: 'Sky Sports Golf Italy',
    id: '574',
  },
  {
    title: 'Sky Sport MotoGP Italy',
    id: '575',
  },
  {
    title: 'Sky Sport Tennis Italy',
    id: '576',
  },
  {
    title: 'Sky Sport F1 Italy',
    id: '577',
  },
  {
    title: 'Sky Sports News UK',
    id: '366',
  },
  {
    title: 'Sky Sports MIX UK',
    id: '449',
  },
  {
    title: 'Sky Sport Top Event DE',
    id: '556',
  },
  {
    title: 'Sky Sport Mix DE',
    id: '557',
  },
  {
    title: 'Sky Sport Bundesliga 1 HD',
    id: '558',
  },
  {
    title: 'Sky Sport Austria 1 HD',
    id: '559',
  },
  {
    title: 'SportsNet New York (SNY)',
    id: '759',
  },
  {
    title: 'Sky Sport Football Italy',
    id: '460',
  },
  {
    title: 'Sky Sport UNO Italy',
    id: '461',
  },
  {
    title: 'Sky Sport Arena Italy',
    id: '462',
  },
  {
    title: 'Sky Sports Racing UK',
    id: '554',
  },
  {
    title: 'Sky UNO Italy',
    id: '881',
  },
  {
    title: 'Sky Sport 1 NZ',
    id: '588',
  },
  {
    title: 'Sky Sport 2 NZ',
    id: '589',
  },
  {
    title: 'Sky Sport 3 NZ',
    id: '590',
  },
  {
    title: 'Sky Sport 4 NZ',
    id: '591',
  },
  {
    title: 'Sky Sport 5 NZ',
    id: '592',
  },
  {
    title: 'Sky Sport 6 NZ',
    id: '593',
  },
  {
    title: 'Sky Sport 7 NZ',
    id: '594',
  },
  {
    title: 'Sky Sport 8 NZ',
    id: '595',
  },
  {
    title: 'Sky Sport 9 NZ',
    id: '596',
  },
  {
    title: 'Sky Sport Select NZ',
    id: '587',
  },
  {
    title: 'Sport TV1 Portugal',
    id: '49',
  },
  {
    title: 'Sport TV2 Portugal',
    id: '74',
  },
  {
    title: 'Sport TV4 Portugal',
    id: '289',
  },
  {
    title: 'Sport TV3 Portugal',
    id: '454',
  },
  {
    title: 'Sport TV5 Portugal',
    id: '290',
  },
  {
    title: 'Sport TV6 Portugal',
    id: '291',
  },
  {
    title: 'SIC Portugal',
    id: '722',
  },
  {
    title: 'SEC Network USA',
    id: '385',
  },
  {
    title: 'SporTV Brasil',
    id: '78',
  },
  {
    title: 'SporTV2 Brasil',
    id: '79',
  },
  {
    title: 'SporTV3 Brasil',
    id: '80',
  },
  {
    title: 'Sport Klub 1 Serbia',
    id: '101',
  },
  {
    title: 'Sport Klub 2 Serbia',
    id: '102',
  },
  {
    title: 'Sport Klub 3 Serbia',
    id: '103',
  },
  {
    title: 'Sport Klub 4 Serbia',
    id: '104',
  },
  {
    title: 'Sport Klub HD Serbia',
    id: '453',
  },
  {
    title: 'Sportsnet Ontario',
    id: '406',
  },
  {
    title: 'Sportsnet One',
    id: '411',
  },
  {
    title: 'Sportsnet West',
    id: '407',
  },
  {
    title: 'Sportsnet East',
    id: '408',
  },
  {
    title: 'Sportsnet 360',
    id: '409',
  },
  {
    title: 'Sportsnet World',
    id: '410',
  },
  {
    title: 'SuperSport Grandstand',
    id: '412',
  },
  {
    title: 'SuperSport PSL',
    id: '413',
  },
  {
    title: 'SuperSport Premier league',
    id: '414',
  },
  {
    title: 'SuperSport LaLiga',
    id: '415',
  },
  {
    title: 'SuperSport Variety 1',
    id: '416',
  },
  {
    title: 'SuperSport Variety 2',
    id: '417',
  },
  {
    title: 'SuperSport Variety 3',
    id: '418',
  },
  {
    title: 'SuperSport Variety 4',
    id: '419',
  },
  {
    title: 'SuperSport Action',
    id: '420',
  },
  {
    title: 'SuperSport Rugby',
    id: '421',
  },
  {
    title: 'SuperSport Golf',
    id: '422',
  },
  {
    title: 'SuperSport Tennis',
    id: '423',
  },
  {
    title: 'SuperSport Motorsport',
    id: '424',
  },
  {
    title: 'Supersport Football',
    id: '56',
  },
  {
    title: 'SuperSport Cricket',
    id: '368',
  },
  {
    title: 'SuperSport MaXimo 1',
    id: '572',
  },
  {
    title: 'Sporting TV Portugal',
    id: '716',
  },
  {
    title: 'SportDigital Fussball',
    id: '571',
  },
  {
    title: 'Spectrum Sportsnet LA',
    id: '764',
  },
  {
    title: 'Sport1+ Germany',
    id: '640',
  },
  {
    title: 'Sport1 Germany',
    id: '641',
  },
  {
    title: 'S4C UK',
    id: '670',
  },
  {
    title: 'SAT.1 DE',
    id: '729',
  },
  {
    title: 'Sky Cinema Premiere UK',
    id: '671',
  },
  {
    title: 'Sky Cinema Select UK',
    id: '672',
  },
  {
    title: 'Sky Cinema Hits UK',
    id: '673',
  },
  {
    title: 'Sky Cinema Greats UK',
    id: '674',
  },
  {
    title: 'Sky Cinema Animation UK',
    id: '675',
  },
  {
    title: 'Sky Cinema Family UK',
    id: '676',
  },
  {
    title: 'Sky Cinema Action UK',
    id: '677',
  },
  {
    title: 'The Hallmark',
    id: '678',
  },
  {
    title: 'Sky Cinema Thriller UK',
    id: '679',
  },
  {
    title: 'The Hallmark',
    id: '680',
  },
  {
    title: 'Sky Cinema Sci-Fi Horror UK',
    id: '681',
  },
  {
    title: 'Sky Cinema Collection Italy',
    id: '859',
  },
  {
    title: 'Sky Cinema Uno Italy',
    id: '860',
  },
  {
    title: 'Sky Cinema Action Italy',
    id: '861',
  },
  {
    title: '8Sky Cinema Comedy Italy',
    id: '862',
  },
  {
    title: 'Sky Cinema Uno +24 Italy',
    id: '863',
  },
  {
    title: 'Sky Cinema Romance Italy',
    id: '864',
  },
  {
    title: 'Sky Cinema Family Italy',
    id: '865',
  },
  {
    title: 'Sky Cinema Due +24 Italy',
    id: '866',
  },
  {
    title: 'Sky Cinema Drama Italy',
    id: '867',
  },
  {
    title: '8Sky Cinema Suspense Italy',
    id: '868',
  },
  {
    title: 'Sky Sport 24 Italy',
    id: '869',
  },
  {
    title: 'Sky Sport Calcio Italy',
    id: '870',
  },
  {
    title: 'Sky Calcio 1 (251) Italy',
    id: '871',
  },
  {
    title: 'Sky Calcio 2 (252) Italy',
    id: '872',
  },
  {
    title: 'Sky Calcio 3 (253) Italy',
    id: '873',
  },
  {
    title: 'Sky Calcio 4 (254) Italy',
    id: '874',
  },
  {
    title: 'Sky Calcio 5 (255) Italy',
    id: '875',
  },
  {
    title: 'Sky Calcio 6 (256) Italy',
    id: '876',
  },
  {
    title: 'Sky Calcio 7 (257) Italy',
    id: '877',
  },
  {
    title: 'Sky Serie Italy',
    id: '880',
  },
  {
    title: 'StarzPlay CricLife 1 HD',
    id: '284',
  },
  {
    title: 'StarzPlay CricLife 2 HD',
    id: '283',
  },
  {
    title: 'StarzPlay CricLife 3 HD',
    id: '282',
  },
  {
    title: 'Sky Showcase UK',
    id: '682',
  },
  {
    title: 'Sky Arts UK',
    id: '683',
  },
  {
    title: 'Sky Comedy UK',
    id: '684',
  },
  {
    title: 'Sky Crime',
    id: '685',
  },
  {
    title: 'Sky History',
    id: '686',
  },
  {
    title: 'SSC Sport 1',
    id: '614',
  },
  {
    title: 'SSC Sport 2',
    id: '615',
  },
  {
    title: 'SSC Sport 3',
    id: '616',
  },
  {
    title: 'SSC Sport 4',
    id: '617',
  },
  {
    title: 'SSC Sport 5',
    id: '618',
  },
  {
    title: 'SSC Sport Extra 1',
    id: '619',
  },
  {
    title: 'SSC Sport Extra 2',
    id: '620',
  },
  {
    title: 'SSC Sport Extra 3',
    id: '621',
  },
  {
    title: 'Sport 1 Israel',
    id: '140',
  },
  {
    title: 'Sport 2 Israel',
    id: '141',
  },
  {
    title: 'Sport 3 Israel',
    id: '142',
  },
  {
    title: 'Sport 4 Israel',
    id: '143',
  },
  {
    title: 'Sport 5 Israel',
    id: '144',
  },
  {
    title: 'Sport 5 PLUS Israel',
    id: '145',
  },
  {
    title: 'Sport 5 Live Israel',
    id: '146',
  },
  {
    title: 'Sport 5 Star Israel',
    id: '147',
  },
  {
    title: 'Sport 5 Gold Israel',
    id: '148',
  },
  {
    title: 'Science Channel',
    id: '294',
  },
  {
    title: 'Showtime USA',
    id: '333',
  },
  {
    title: 'Showtime SHOxBET USA',
    id: '685',
  },
  {
    title: 'Starz',
    id: '335',
  },
  {
    title: 'Sky Witness HD',
    id: '361',
  },
  {
    title: 'Sixx DE',
    id: '732',
  },
  {
    title: 'Sky Atlantic',
    id: '362',
  },
  {
    title: 'SYFY USA',
    id: '373',
  },
  {
    title: 'Sundance TV',
    id: '658',
  },
  {
    title: 'SWR DE',
    id: '735',
  },
  {
    title: 'SUPER RTL DE',
    id: '738',
  },
  {
    title: 'SR Fernsehen DE',
    id: '739',
  },
  {
    title: 'Smithsonian Channel',
    id: '601',
  },
  {
    title: 'TNT Sports 1 UK',
    id: '31',
  },
  {
    title: 'TNT Sports 2 UK',
    id: '32',
  },
  {
    title: 'TNT Sports 3 UK',
    id: '33',
  },
  {
    title: 'TNT Sports 4 UK',
    id: '34',
  },
  {
    title: 'TSN1',
    id: '111',
  },
  {
    title: 'TSN2',
    id: '112',
  },
  {
    title: 'TSN3',
    id: '113',
  },
  {
    title: 'TSN4',
    id: '114',
  },
  {
    title: 'TSN5',
    id: '115',
  },
  {
    title: 'TVN HD Poland',
    id: '565',
  },
  {
    title: 'TVN24 Poland',
    id: '444',
  },
  {
    title: 'TVP1 Poland',
    id: '560',
  },
  {
    title: 'TVP2 Poland',
    id: '561',
  },
  {
    title: 'Telecinco Spain',
    id: '532',
  },
  {
    title: 'TVE La 1 Spain',
    id: '533',
  },
  {
    title: 'TVE La 2 Spain',
    id: '536',
  },
  {
    title: 'TVI Portugal',
    id: '723',
  },
  {
    title: 'TVI Reality Portugal',
    id: '724',
  },
  {
    title: 'Teledeporte Spain (TDP)',
    id: '529',
  },
  {
    title: 'TYC Sports Argentina',
    id: '746',
  },
  {
    title: 'TVP Sport Poland',
    id: '128',
  },
  {
    title: 'TNT Brasil',
    id: '87',
  },
  {
    title: 'TNT Sports Argentina',
    id: '388',
  },
  {
    title: 'TNT Sports HD Chile',
    id: '642',
  },
  {
    title: 'Tennis Channel',
    id: '40',
  },
  {
    title: 'Ten Sports PK',
    id: '741',
  },
  {
    title: 'TUDN USA',
    id: '66',
  },
  {
    title: 'Telemundo',
    id: '131',
  },
  {
    title: 'TBS USA',
    id: '336',
  },
  {
    title: 'TLC',
    id: '337',
  },
  {
    title: 'TNT USA',
    id: '338',
  },
  {
    title: 'TVA Sports',
    id: '833',
  },
  {
    title: 'TVA Sports 2',
    id: '834',
  },
  {
    title: 'Travel Channel',
    id: '340',
  },
  {
    title: 'TruTV USA',
    id: '341',
  },
  {
    title: 'TVLAND',
    id: '342',
  },
  {
    title: 'TCM USA',
    id: '644',
  },
  {
    title: 'TMC Channel USA',
    id: '698',
  },
  {
    title: 'The Food Network',
    id: '384',
  },
  {
    title: 'The Weather Channel',
    id: '394',
  },
  {
    title: 'TVP INFO',
    id: '452',
  },
  {
    title: 'TeenNick',
    id: '650',
  },
  {
    title: 'TV ONE USA',
    id: '660',
  },
  {
    title: 'TV2 Bornholm Denmark',
    id: '807',
  },
  {
    title: 'TV2 Sport X Denmark',
    id: '808',
  },
  {
    title: 'TV3 Sport Denmark',
    id: '809',
  },
  {
    title: 'TV2 Sport Denmark',
    id: '810',
  },
  {
    title: 'TV2 Denmark',
    id: '817',
  },
  {
    title: 'TV2 Zulu',
    id: '818',
  },
  {
    title: 'TV3+ Denmark',
    id: '819',
  },
  {
    title: 'TVO CA',
    id: '842',
  },
  {
    title: 'Tennis+ 1',
    id: '700',
  },
  {
    title: 'Tennis+ 2',
    id: '701',
  },
  {
    title: 'Tennis+ 3',
    id: '702',
  },
  {
    title: 'Tennis+ 4',
    id: '703',
  },
  {
    title: 'Tennis+ 5',
    id: '704',
  },
  {
    title: 'Tennis+ 6',
    id: '705',
  },
  {
    title: 'Tennis+ 7',
    id: '706',
  },
  {
    title: 'Tennis+ 8',
    id: '707',
  },
  {
    title: 'Tennis+ 9',
    id: '708',
  },
  {
    title: 'Tennis+ 10',
    id: '709',
  },
  {
    title: 'Tennis+ 11',
    id: '710',
  },
  {
    title: 'Tennis+ 12',
    id: '711',
  },
  {
    title: 'Tennis+ 13',
    id: '712',
  },
  {
    title: 'Tennis+ 14',
    id: '713',
  },
  {
    title: 'Tennis+ 15',
    id: '714',
  },
  {
    title: 'USA Network',
    id: '343',
  },
  {
    title: 'Universal Kids USA',
    id: '668',
  },
  {
    title: 'Univision',
    id: '132',
  },
  {
    title: 'Unimas',
    id: '133',
  },
  {
    title: 'Viaplay Sports 1 UK',
    id: '451',
  },
  {
    title: 'Viaplay Sports 2 UK',
    id: '550',
  },
  {
    title: 'Viaplay Xtra UK',
    id: '597',
  },
  {
    title: '#Vamos Spain',
    id: '521',
  },
  {
    title: 'V Film Premiere',
    id: '815',
  },
  {
    title: 'V Film Family',
    id: '816',
  },
  {
    title: 'VH1 USA',
    id: '344',
  },
  {
    title: 'Veronica NL Netherland',
    id: '378',
  },
  {
    title: 'VTV+ Uruguay',
    id: '391',
  },
  {
    title: 'VICE TV',
    id: '659',
  },
  {
    title: 'Willow Cricket',
    id: '346',
  },
  {
    title: 'Willow XTRA',
    id: '598',
  },
  {
    title: 'WWE Network',
    id: '376',
  },
  {
    title: 'Win Sports+ Columbia',
    id: '392',
  },
  {
    title: 'WETV USA',
    id: '655',
  },
  {
    title: 'WDR DE',
    id: '734',
  },
  {
    title: 'YES Network USA',
    id: '763',
  },
  {
    title: 'Yes Movies Action Israel',
    id: '543',
  },
  {
    title: 'Yes Movies Kids Israel',
    id: '544',
  },
  {
    title: 'Yes Movies Comedy Israel',
    id: '545',
  },
  {
    title: 'Yas TV UAE',
    id: '609',
  },
  {
    title: 'Yes TV CA',
    id: '837',
  },
  {
    title: 'Ziggo Sport Docu NL',
    id: '383',
  },
  {
    title: 'Ziggo Sport Select NL',
    id: '393',
  },
  {
    title: 'Ziggo Sport Racing NL',
    id: '396',
  },
  {
    title: 'Ziggo Sport Voetbal NL',
    id: '398',
  },
  {
    title: 'BBC 1 DE',
    id: '727',
  },
  {
    title: 'ZDF Info DE',
    id: '728',
  },
  {
    title: '20 Mediaset Italy',
    id: '857',
  },
  {
    title: "6'eren Denmark",
    id: '800',
  },
  {
    title: '#0 Spain',
    id: '437',
  },
  {
    title: '5 USA',
    id: '360',
  },
  {
    title: '3sat DE',
    id: '726',
  },
  {
    title: '18+ (Player-01)',
    id: '501',
  },
  {
    title: '18+ (Player-02)',
    id: '502',
  },
  {
    title: '18+ (Player-03)',
    id: '503',
  },
  {
    title: '18+ (Player-04)',
    id: '504',
  },
  {
    title: '18+ (Player-05)',
    id: '505',
  },
  {
    title: '18+ (Player-06)',
    id: '506',
  },
  {
    title: '18+ (Player-07)',
    id: '507',
  },
  {
    title: '18+ (Player-08)',
    id: '508',
  },
  {
    title: '18+ (Player-09)',
    id: '509',
  },
  {
    title: '18+ (Player-10)',
    id: '510',
  },
  {
    title: '18+ (Player-11)',
    id: '511',
  },
  {
    title: '18+ (Player-12)',
    id: '512',
  },
  {
    title: '18+ (Player-13)',
    id: '513',
  },
  {
    title: '18+ (Player-14)',
    id: '514',
  },
  {
    title: '18+ (Player-15)',
    id: '515',
  },
  {
    title: '18+ (Player-16)',
    id: '516',
  },
  {
    title: '18+ (Player-17)',
    id: '517',
  },
  {
    title: '18+ (Player-18)',
    id: '518',
  },
  {
    title: '18+ (Player-19)',
    id: '519',
  },
  {
    title: '18+ (Player-20)',
    id: '520',
  },
];

export default channels;
