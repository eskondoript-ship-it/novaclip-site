/* ============================================================================
   NOVATOOLS — the full catalogue
   ============================================================================
   Ten thousand tools, and this file is honest about where they come from.

   WHAT THE TEN THOUSAND ACTUALLY ARE

     ~250    hand-built tools, each one its own thing with its own interface —
             the word counter, the JSON formatter, the sound board, the photo
             cleanup, the thumbnail tester. These live in tools.html.
     ~9,750  generated from the tables below: every ordered pair of units in
             twenty measurement families, every pair of the common number
             bases, and every pair of forty time zones.

   EVERY ONE OF THEM WORKS. Nothing here is a stub, a "coming soon", or a card
   that opens an empty panel. A generated tool is a real converter with a real
   formula behind it — "metres to feet" computes, shows its working, and is
   reversible.

   THE THING TO SAY OUT LOUD

   Nine and a half thousand of these are conversion pairs. That is one idea
   repeated, not ten thousand ideas. A product person could fairly say this
   should be three tools with dropdowns instead.

   The argument for doing it this way is that it matches how people actually
   look: nobody searches "unit converter", they search "cm to inches". Each
   pair being its own tool with its own name is what makes the search box
   useful. But the count is a count of conversions, not of inventions, and
   anybody quoting "10,000 tools" should know which one they are quoting.

   HOW IT STAYS SMALL

   The tables below are about 18KB. The ten thousand tools are built from them
   in memory when the page loads, which takes a few milliseconds. Writing them
   out as literals would be a 2MB download for the same result.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_TOOLS) return;

  /* ==========================================================================
     UNITS
     ==========================================================================
     Each family: a base unit, then [key, singular, plural, factor-to-base].
     Factors are exact where an exact value exists — the international foot has
     been exactly 0.3048m since 1959, and using 0.3047997 because it looks more
     precise would be wrong by design.
     ======================================================================== */
  var U = {
    length: { label: 'Length', base: 'metre', units: [
      ['m','metre','metres',1], ['km','kilometre','kilometres',1000],
      ['cm','centimetre','centimetres',0.01], ['mm','millimetre','millimetres',0.001],
      ['um','micrometre','micrometres',1e-6], ['nm','nanometre','nanometres',1e-9],
      ['pm','picometre','picometres',1e-12], ['dm','decimetre','decimetres',0.1],
      ['dam','decametre','decametres',10], ['hm','hectometre','hectometres',100],
      ['Mm','megametre','megametres',1e6], ['Gm','gigametre','gigametres',1e9],
      ['mi','mile','miles',1609.344], ['yd','yard','yards',0.9144],
      ['ft','foot','feet',0.3048], ['in','inch','inches',0.0254],
      ['nmi','nautical mile','nautical miles',1852],
      ['fur','furlong','furlongs',201.168], ['ch','chain','chains',20.1168],
      ['rd','rod','rods',5.0292], ['ftm','fathom','fathoms',1.8288],
      ['lea','league','leagues',4828.032], ['A','angstrom','angstroms',1e-10],
      ['ly','light year','light years',9.4607304725808e15],
      ['au','astronomical unit','astronomical units',1.495978707e11],
      ['pc','parsec','parsecs',3.0856775814913673e16],
      ['mil','mil','mils',2.54e-5], ['hand','hand','hands',0.1016],
      ['link','link','links',0.201168], ['cable','cable','cables',185.2],
      ['pt','point','points',0.0003527777777777778],
      ['pica','pica','picas',0.004233333333333333],
      ['twip','twip','twips',1.7638888888888889e-5],
      ['ell','ell','ells',1.143], ['cubit','cubit','cubits',0.4572],
      ['span','span','spans',0.2286], ['barleycorn','barleycorn','barleycorns',0.008466666666666667],
      ['thou','thou','thou',2.54e-5], ['micron','micron','microns',1e-6],
      ['smoot','smoot','smoots',1.70180]
    ]},
    mass: { label: 'Mass', base: 'kilogram', units: [
      ['kg','kilogram','kilograms',1], ['g','gram','grams',0.001],
      ['mg','milligram','milligrams',1e-6], ['ug','microgram','micrograms',1e-9],
      ['t','tonne','tonnes',1000], ['lb','pound','pounds',0.45359237],
      ['oz','ounce','ounces',0.028349523125], ['st','stone','stones',6.35029318],
      ['ton_us','US ton','US tons',907.18474], ['ton_uk','long ton','long tons',1016.0469088],
      ['ct','carat','carats',0.0002], ['gr','grain','grains',6.479891e-5],
      ['dwt','pennyweight','pennyweights',0.00155517384],
      ['ozt','troy ounce','troy ounces',0.0311034768],
      ['lbt','troy pound','troy pounds',0.3732417216],
      ['cwt_us','US hundredweight','US hundredweights',45.359237],
      ['cwt_uk','long hundredweight','long hundredweights',50.80234544],
      ['q','quintal','quintals',100], ['slug','slug','slugs',14.5939029372],
      ['dr','dram','drams',0.0017718451953125], ['dag','decagram','decagrams',0.01],
      ['hg','hectogram','hectograms',0.1], ['Mg','megagram','megagrams',1000],
      ['dg','decigram','decigrams',0.0001], ['cg','centigram','centigrams',1e-5],
      ['ng','nanogram','nanograms',1e-12], ['u','atomic mass unit','atomic mass units',1.66053906660e-27],
      ['firkin','firkin','firkins',40.8233133], ['tola','tola','tolas',0.0116638038],
      ['catty','catty','catties',0.6047989]
    ]},
    volume: { label: 'Volume', base: 'litre', units: [
      ['l','litre','litres',1], ['ml','millilitre','millilitres',0.001],
      ['cl','centilitre','centilitres',0.01], ['dl','decilitre','decilitres',0.1],
      ['dal','decalitre','decalitres',10], ['hl','hectolitre','hectolitres',100],
      ['kl','kilolitre','kilolitres',1000],
      ['m3','cubic metre','cubic metres',1000], ['cm3','cubic centimetre','cubic centimetres',0.001],
      ['mm3','cubic millimetre','cubic millimetres',1e-6],
      ['km3','cubic kilometre','cubic kilometres',1e12],
      ['in3','cubic inch','cubic inches',0.016387064],
      ['ft3','cubic foot','cubic feet',28.316846592],
      ['yd3','cubic yard','cubic yards',764.554857984],
      ['gal_us','US gallon','US gallons',3.785411784],
      ['gal_uk','imperial gallon','imperial gallons',4.54609],
      ['qt_us','US quart','US quarts',0.946352946],
      ['qt_uk','imperial quart','imperial quarts',1.1365225],
      ['pt_us','US pint','US pints',0.473176473],
      ['pt_uk','imperial pint','imperial pints',0.56826125],
      ['cup_us','US cup','US cups',0.2365882365],
      ['cup_metric','metric cup','metric cups',0.25],
      ['floz_us','US fluid ounce','US fluid ounces',0.0295735295625],
      ['floz_uk','imperial fluid ounce','imperial fluid ounces',0.0284130625],
      ['tbsp_us','US tablespoon','US tablespoons',0.01478676478125],
      ['tsp_us','US teaspoon','US teaspoons',0.00492892159375],
      ['tbsp_metric','metric tablespoon','metric tablespoons',0.015],
      ['tsp_metric','metric teaspoon','metric teaspoons',0.005],
      ['bbl_oil','oil barrel','oil barrels',158.987294928],
      ['bbl_us','US barrel','US barrels',119.240471196],
      ['gill_us','US gill','US gills',0.11829411825],
      ['gill_uk','imperial gill','imperial gills',0.1420653125],
      ['dram_fl','fluid dram','fluid drams',0.003696691195312],
      ['peck','peck','pecks',8.80976754172],
      ['bushel','bushel','bushels',35.23907016688],
      ['shot','shot','shots',0.0443603]
    ]},
    area: { label: 'Area', base: 'square metre', units: [
      ['m2','square metre','square metres',1], ['km2','square kilometre','square kilometres',1e6],
      ['cm2','square centimetre','square centimetres',1e-4],
      ['mm2','square millimetre','square millimetres',1e-6],
      ['ha','hectare','hectares',10000], ['a','are','ares',100],
      ['mi2','square mile','square miles',2589988.110336],
      ['ac','acre','acres',4046.8564224],
      ['yd2','square yard','square yards',0.83612736],
      ['ft2','square foot','square feet',0.09290304],
      ['in2','square inch','square inches',0.00064516],
      ['rood','rood','roods',1011.7141056],
      ['perch','square perch','square perches',25.29285264],
      ['dunam','dunam','dunams',1000], ['barn','barn','barns',1e-28],
      ['township','township','townships',93239571.972],
      ['section','section','sections',2589988.110336],
      ['sqrd','square rod','square rods',25.29285264],
      ['sqch','square chain','square chains',404.68564224],
      ['tsubo','tsubo','tsubo',3.305785],
      ['cho','cho','cho',9917.36],
      ['bigha','bigha','bighas',2529.28],
      ['cent','cent','cents',40.4685642],
      ['guntha','guntha','gunthas',101.17141],
      ['sqmil','square mil','square mils',6.4516e-10]
    ]},
    data: { label: 'Data', base: 'byte', units: [
      ['B','byte','bytes',1], ['bit','bit','bits',0.125],
      ['kB','kilobyte','kilobytes',1000], ['MB','megabyte','megabytes',1e6],
      ['GB','gigabyte','gigabytes',1e9], ['TB','terabyte','terabytes',1e12],
      ['PB','petabyte','petabytes',1e15], ['EB','exabyte','exabytes',1e18],
      ['KiB','kibibyte','kibibytes',1024], ['MiB','mebibyte','mebibytes',1048576],
      ['GiB','gibibyte','gibibytes',1073741824], ['TiB','tebibyte','tebibytes',1099511627776],
      ['PiB','pebibyte','pebibytes',1125899906842624],
      ['kbit','kilobit','kilobits',125], ['Mbit','megabit','megabits',125000],
      ['Gbit','gigabit','gigabits',125000000], ['Tbit','terabit','terabits',1.25e11],
      ['Kibit','kibibit','kibibits',128], ['Mibit','mebibit','mebibits',131072],
      ['Gibit','gibibit','gibibits',134217728],
      ['nibble','nibble','nibbles',0.5],
      ['word','word','words',2], ['dword','double word','double words',4],
      ['block','block','blocks',512]
    ]},
    time: { label: 'Time', base: 'second', units: [
      ['s','second','seconds',1], ['ms','millisecond','milliseconds',0.001],
      ['us','microsecond','microseconds',1e-6], ['ns','nanosecond','nanoseconds',1e-9],
      ['min','minute','minutes',60], ['h','hour','hours',3600],
      ['d','day','days',86400], ['wk','week','weeks',604800],
      ['fortnight','fortnight','fortnights',1209600],
      ['mo','month','months',2629746], ['yr','year','years',31556952],
      ['decade','decade','decades',315569520], ['century','century','centuries',3155695200],
      ['millennium','millennium','millennia',31556952000],
      ['ps','picosecond','picoseconds',1e-12],
      ['shake','shake','shakes',1e-8],
      ['jiffy','jiffy','jiffies',0.01],
      ['sidereal_day','sidereal day','sidereal days',86164.0905],
      ['lunar_month','lunar month','lunar months',2551442.9],
      ['quarter','quarter','quarters',7889238]
    ]},
    speed: { label: 'Speed', base: 'metre per second', units: [
      ['mps','metre per second','metres per second',1],
      ['kph','kilometre per hour','kilometres per hour',0.2777777777777778],
      ['mph','mile per hour','miles per hour',0.44704],
      ['fps','foot per second','feet per second',0.3048],
      ['kn','knot','knots',0.5144444444444445],
      ['mach','mach','mach',340.29],
      ['c','speed of light','speed of light',299792458],
      ['cmps','centimetre per second','centimetres per second',0.01],
      ['mmps','millimetre per second','millimetres per second',0.001],
      ['kmps','kilometre per second','kilometres per second',1000],
      ['mips','mile per second','miles per second',1609.344],
      ['ipm','inch per minute','inches per minute',0.000423333333],
      ['fpm','foot per minute','feet per minute',0.00508],
      ['mpm','metre per minute','metres per minute',0.016666666666666666],
      ['ypm','yard per minute','yards per minute',0.01524],
      ['furlong_fortnight','furlong per fortnight','furlongs per fortnight',0.00016630952]
    ]},
    energy: { label: 'Energy', base: 'joule', units: [
      ['J','joule','joules',1], ['kJ','kilojoule','kilojoules',1000],
      ['MJ','megajoule','megajoules',1e6], ['GJ','gigajoule','gigajoules',1e9],
      ['cal','calorie','calories',4.184], ['kcal','kilocalorie','kilocalories',4184],
      ['Wh','watt hour','watt hours',3600], ['kWh','kilowatt hour','kilowatt hours',3.6e6],
      ['MWh','megawatt hour','megawatt hours',3.6e9],
      ['eV','electronvolt','electronvolts',1.602176634e-19],
      ['keV','kiloelectronvolt','kiloelectronvolts',1.602176634e-16],
      ['MeV','megaelectronvolt','megaelectronvolts',1.602176634e-13],
      ['BTU','British thermal unit','British thermal units',1055.05585262],
      ['therm','therm','therms',105505585.262],
      ['ftlb','foot pound','foot pounds',1.3558179483314004],
      ['erg','erg','ergs',1e-7],
      ['toe','tonne of oil equivalent','tonnes of oil equivalent',4.1868e10],
      ['tnt','tonne of TNT','tonnes of TNT',4.184e9],
      ['hph','horsepower hour','horsepower hours',2684519.537696],
      ['Ha','hartree','hartrees',4.3597447222071e-18],
      ['quad','quad','quads',1.05505585262e18],
      ['thermie','thermie','thermies',4185800]
    ]},
    pressure: { label: 'Pressure', base: 'pascal', units: [
      ['Pa','pascal','pascals',1], ['kPa','kilopascal','kilopascals',1000],
      ['MPa','megapascal','megapascals',1e6], ['hPa','hectopascal','hectopascals',100],
      ['bar','bar','bars',100000], ['mbar','millibar','millibars',100],
      ['atm','atmosphere','atmospheres',101325],
      ['psi','pound per square inch','pounds per square inch',6894.757293168362],
      ['ksi','kip per square inch','kips per square inch',6894757.293168362],
      ['torr','torr','torr',133.32236842105263],
      ['mmHg','millimetre of mercury','millimetres of mercury',133.322387415],
      ['inHg','inch of mercury','inches of mercury',3386.389],
      ['mmH2O','millimetre of water','millimetres of water',9.80665],
      ['inH2O','inch of water','inches of water',249.0889],
      ['at','technical atmosphere','technical atmospheres',98066.5],
      ['dyncm2','dyne per square centimetre','dynes per square centimetre',0.1],
      ['psf','pound per square foot','pounds per square foot',47.88025898],
      ['Ba','barye','baryes',0.1]
    ]},
    power: { label: 'Power', base: 'watt', units: [
      ['W','watt','watts',1], ['kW','kilowatt','kilowatts',1000],
      ['MW','megawatt','megawatts',1e6], ['GW','gigawatt','gigawatts',1e9],
      ['mW','milliwatt','milliwatts',0.001], ['uW','microwatt','microwatts',1e-6],
      ['hp','horsepower','horsepower',745.6998715822702],
      ['hp_metric','metric horsepower','metric horsepower',735.49875],
      ['BTUh','BTU per hour','BTUs per hour',0.29307107017222],
      ['ftlbs','foot pound per second','foot pounds per second',1.3558179483314004],
      ['cal_s','calorie per second','calories per second',4.184],
      ['kcal_h','kilocalorie per hour','kilocalories per hour',1.163],
      ['erg_s','erg per second','ergs per second',1e-7],
      ['TR','ton of refrigeration','tons of refrigeration',3516.8528420667],
      ['VA','volt ampere','volt amperes',1],
      ['dBm','milliwatt (dBm ref)','milliwatts (dBm ref)',0.001],
      ['PS','pferdestarke','pferdestarke',735.49875],
      ['TW','terawatt','terawatts',1e12]
    ]},
    angle: { label: 'Angle', base: 'degree', units: [
      ['deg','degree','degrees',1], ['rad','radian','radians',57.29577951308232],
      ['grad','gradian','gradians',0.9], ['arcmin','arcminute','arcminutes',0.016666666666666666],
      ['arcsec','arcsecond','arcseconds',0.0002777777777777778],
      ['turn','turn','turns',360], ['quad','quadrant','quadrants',90],
      ['sextant','sextant','sextants',60], ['octant','octant','octants',45],
      ['mil_nato','NATO mil','NATO mils',0.05625],
      ['point','compass point','compass points',11.25],
      ['sign','sign','signs',30]
    ]},
    force: { label: 'Force', base: 'newton', units: [
      ['N','newton','newtons',1], ['kN','kilonewton','kilonewtons',1000],
      ['MN','meganewton','meganewtons',1e6], ['mN','millinewton','millinewtons',0.001],
      ['dyn','dyne','dynes',1e-5], ['lbf','pound force','pounds force',4.4482216152605],
      ['ozf','ounce force','ounces force',0.27801385095378125],
      ['kgf','kilogram force','kilograms force',9.80665],
      ['gf','gram force','grams force',0.00980665],
      ['tonf','ton force','tons force',8896.443230521],
      ['pdl','poundal','poundals',0.138254954376],
      ['kip','kip','kips',4448.2216152605]
    ]},
    frequency: { label: 'Frequency', base: 'hertz', units: [
      ['Hz','hertz','hertz',1], ['kHz','kilohertz','kilohertz',1000],
      ['MHz','megahertz','megahertz',1e6], ['GHz','gigahertz','gigahertz',1e9],
      ['THz','terahertz','terahertz',1e12], ['mHz','millihertz','millihertz',0.001],
      ['rpm','revolution per minute','revolutions per minute',0.016666666666666666],
      ['rps','revolution per second','revolutions per second',1],
      ['bpm','beat per minute','beats per minute',0.016666666666666666],
      ['cpm','cycle per minute','cycles per minute',0.016666666666666666]
    ]},
    temperature: { label: 'Temperature', base: 'celsius', special: 'temp', units: [
      ['C','Celsius','Celsius',1], ['F','Fahrenheit','Fahrenheit',1],
      ['K','Kelvin','Kelvin',1], ['R','Rankine','Rankine',1],
      ['Re','Reaumur','Reaumur',1], ['Ro','Romer','Romer',1],
      ['De','Delisle','Delisle',1], ['N','Newton scale','Newton scale',1]
    ]},
    density: { label: 'Density', base: 'kilogram per cubic metre', units: [
      ['kgm3','kilogram per cubic metre','kilograms per cubic metre',1],
      ['gcm3','gram per cubic centimetre','grams per cubic centimetre',1000],
      ['gml','gram per millilitre','grams per millilitre',1000],
      ['gl','gram per litre','grams per litre',1],
      ['kgl','kilogram per litre','kilograms per litre',1000],
      ['lbft3','pound per cubic foot','pounds per cubic foot',16.018463373960138],
      ['lbin3','pound per cubic inch','pounds per cubic inch',27679.904710203125],
      ['ozin3','ounce per cubic inch','ounces per cubic inch',1729.994044387695],
      ['lbgal','pound per US gallon','pounds per US gallon',119.82642731689663],
      ['slugft3','slug per cubic foot','slugs per cubic foot',515.3788183932924],
      ['tm3','tonne per cubic metre','tonnes per cubic metre',1000],
      ['mgl','milligram per litre','milligrams per litre',0.001]
    ]},
    flow: { label: 'Flow rate', base: 'litre per second', units: [
      ['lps','litre per second','litres per second',1],
      ['lpm','litre per minute','litres per minute',0.016666666666666666],
      ['lph','litre per hour','litres per hour',0.0002777777777777778],
      ['m3s','cubic metre per second','cubic metres per second',1000],
      ['m3h','cubic metre per hour','cubic metres per hour',0.2777777777777778],
      ['gpm_us','US gallon per minute','US gallons per minute',0.0630901964],
      ['gph_us','US gallon per hour','US gallons per hour',0.001051503273],
      ['gpm_uk','imperial gallon per minute','imperial gallons per minute',0.07576819],
      ['cfs','cubic foot per second','cubic feet per second',28.316846592],
      ['cfm','cubic foot per minute','cubic feet per minute',0.4719474432],
      ['mls','millilitre per second','millilitres per second',0.001],
      ['bpd','barrel per day','barrels per day',0.00184013]
    ]},
    torque: { label: 'Torque', base: 'newton metre', units: [
      ['Nm','newton metre','newton metres',1],
      ['kNm','kilonewton metre','kilonewton metres',1000],
      ['Ncm','newton centimetre','newton centimetres',0.01],
      ['lbft','pound foot','pound feet',1.3558179483314004],
      ['lbin','pound inch','pound inches',0.1129848290276167],
      ['ozin','ounce inch','ounce inches',0.00706155183333],
      ['kgfm','kilogram force metre','kilogram force metres',9.80665],
      ['kgfcm','kilogram force centimetre','kilogram force centimetres',0.0980665],
      ['dyncm','dyne centimetre','dyne centimetres',1e-7],
      ['gfcm','gram force centimetre','gram force centimetres',9.80665e-5]
    ]},
    fuel: { label: 'Fuel economy', base: 'kilometre per litre', special: 'fuel', units: [
      ['kmpl','kilometre per litre','kilometres per litre',1],
      ['mpg_us','mile per US gallon','miles per US gallon',1],
      ['mpg_uk','mile per imperial gallon','miles per imperial gallon',1],
      ['l100km','litre per 100 km','litres per 100 km',1],
      ['mpl','mile per litre','miles per litre',1],
      ['kmpg_us','kilometre per US gallon','kilometres per US gallon',1],
      ['gal100mi_us','US gallon per 100 miles','US gallons per 100 miles',1],
      ['l100mi','litre per 100 miles','litres per 100 miles',1]
    ]},
    illuminance: { label: 'Illuminance', base: 'lux', units: [
      ['lx','lux','lux',1], ['ph','phot','phots',10000],
      ['fc','foot candle','foot candles',10.76391041670972],
      ['nx','nox','nox',0.001],
      ['lmm2','lumen per square metre','lumens per square metre',1],
      ['lmcm2','lumen per square centimetre','lumens per square centimetre',10000],
      ['lmft2','lumen per square foot','lumens per square foot',10.76391041670972],
      ['mlx','millilux','millilux',0.001]
    ]},
    cooking: { label: 'Cooking', base: 'millilitre', units: [
      ['ml','millilitre','millilitres',1], ['l','litre','litres',1000],
      ['tsp_us','US teaspoon','US teaspoons',4.92892159375],
      ['tbsp_us','US tablespoon','US tablespoons',14.78676478125],
      ['floz_us','US fluid ounce','US fluid ounces',29.5735295625],
      ['cup_us','US cup','US cups',236.5882365],
      ['pt_us','US pint','US pints',473.176473],
      ['qt_us','US quart','US quarts',946.352946],
      ['gal_us','US gallon','US gallons',3785.411784],
      ['tsp_uk','UK teaspoon','UK teaspoons',5.91938802083],
      ['tbsp_uk','UK tablespoon','UK tablespoons',17.7581640625],
      ['floz_uk','UK fluid ounce','UK fluid ounces',28.4130625],
      ['cup_uk','UK cup','UK cups',284.130625],
      ['pt_uk','UK pint','UK pints',568.26125],
      ['cup_metric','metric cup','metric cups',250],
      ['tsp_metric','metric teaspoon','metric teaspoons',5],
      ['tbsp_metric','metric tablespoon','metric tablespoons',15],
      ['dsp','dessertspoon','dessertspoons',10],
      ['drop','drop','drops',0.05],
      ['dash','dash','dashes',0.616115]
    ]}
  };

  /* One typo in a table of six hundred numbers is invisible until somebody
     converts something and gets nonsense. This catches the shape of it. */
  Object.keys(U).forEach(function (k) {
    U[k].units = U[k].units.filter(function (u) {
      return u && u.length === 4 && typeof u[3] === 'number' && isFinite(u[3]) && u[3] > 0;
    });
  });

  /* ==========================================================================
     TEMPERATURE AND FUEL ECONOMY ARE NOT RATIOS
     ==========================================================================
     Every other family converts by multiplying. These two do not: temperature
     scales have offsets, and fuel economy inverts — more litres per 100km is
     WORSE, so treating it as a factor gets the direction backwards as well as
     the number. They convert through their own base explicitly.
     ======================================================================== */
  var TEMP = {
    C:  { to: function (v) { return v; },                  from: function (c) { return c; } },
    F:  { to: function (v) { return (v - 32) * 5 / 9; },   from: function (c) { return c * 9 / 5 + 32; } },
    K:  { to: function (v) { return v - 273.15; },         from: function (c) { return c + 273.15; } },
    R:  { to: function (v) { return (v - 491.67) * 5 / 9; }, from: function (c) { return (c + 273.15) * 9 / 5; } },
    Re: { to: function (v) { return v * 5 / 4; },          from: function (c) { return c * 4 / 5; } },
    Ro: { to: function (v) { return (v - 7.5) * 40 / 21; }, from: function (c) { return c * 21 / 40 + 7.5; } },
    De: { to: function (v) { return 100 - v * 2 / 3; },    from: function (c) { return (100 - c) * 3 / 2; } },
    N:  { to: function (v) { return v * 100 / 33; },       from: function (c) { return c * 33 / 100; } }
  };
  var FUEL = {                                   // everything through km/L
    kmpl:         { to: function (v) { return v; },            from: function (k) { return k; } },
    mpg_us:       { to: function (v) { return v * 0.425143707; }, from: function (k) { return k / 0.425143707; } },
    mpg_uk:       { to: function (v) { return v * 0.354006189; }, from: function (k) { return k / 0.354006189; } },
    l100km:       { to: function (v) { return v > 0 ? 100 / v : 0; }, from: function (k) { return k > 0 ? 100 / k : 0; } },
    mpl:          { to: function (v) { return v * 1.609344; },  from: function (k) { return k / 1.609344; } },
    kmpg_us:      { to: function (v) { return v * 0.264172052; }, from: function (k) { return k / 0.264172052; } },
    gal100mi_us:  { to: function (v) { return v > 0 ? 42.5143707 / v : 0; }, from: function (k) { return k > 0 ? 42.5143707 / k : 0; } },
    l100mi:       { to: function (v) { return v > 0 ? 160.9344 / v : 0; },   from: function (k) { return k > 0 ? 160.9344 / k : 0; } }
  };

  /* ==========================================================================
     NUMBER BASES AND TIME ZONES
     ======================================================================== */
  var BASES = [
    [2,'binary'], [3,'ternary'], [4,'quaternary'], [5,'quinary'], [6,'senary'],
    [7,'septenary'], [8,'octal'], [9,'nonary'], [10,'decimal'], [11,'undecimal'],
    [12,'duodecimal'], [13,'tridecimal'], [14,'tetradecimal'], [15,'pentadecimal'],
    [16,'hexadecimal'], [20,'vigesimal'], [32,'duotrigesimal'], [36,'hexatrigesimal']
  ];

  /* Offsets in hours from UTC. Fixed, and the tool says so — a converter that
     silently guesses whether a date is in summer time is worse than one that
     tells you it does not handle it. */
  var ZONES = [
    ['UTC','UTC',0], ['GMT','London (GMT)',0], ['WET','Lisbon',0],
    ['CET','Paris / Berlin / Madrid',1], ['CAT','Cairo',2], ['EET','Athens / Helsinki',2],
    ['MSK','Moscow',3], ['AST','Riyadh',3], ['GST','Dubai',4], ['PKT','Karachi',5],
    ['IST','Delhi / Mumbai',5.5], ['NPT','Kathmandu',5.75], ['BST_D','Dhaka',6],
    ['MMT','Yangon',6.5], ['ICT','Bangkok / Jakarta',7], ['CST_C','Beijing / Shanghai',8],
    ['SGT','Singapore',8], ['HKT','Hong Kong',8], ['AWST','Perth',8],
    ['JST','Tokyo',9], ['KST','Seoul',9], ['ACST','Adelaide',9.5],
    ['AEST','Sydney / Melbourne',10], ['ChST','Guam',10], ['SBT','Honiara',11],
    ['NZST','Auckland',12], ['FJT','Suva',12],
    ['AZOT','Azores',-1], ['CVT','Cape Verde',-1], ['BRT','Sao Paulo',-3],
    ['ART','Buenos Aires',-3], ['NST','St Johns',-3.5], ['AST_A','Halifax',-4],
    ['VET','Caracas',-4], ['EST','New York / Toronto',-5], ['COT','Bogota',-5],
    ['CST','Chicago / Mexico City',-6], ['MST','Denver',-7], ['PST','Los Angeles / Vancouver',-8],
    ['AKST','Anchorage',-9], ['HST','Honolulu',-10],
    ['NUT','Alofi',-11], ['AoE','Baker Island',-12]
  ];

  /* ==========================================================================
     BUILDING THE CATALOGUE
     ==========================================================================
     Ids are stable and readable, because they end up in the URL hash: a link
     to conv-length-m-ft still works after this file is rewritten.
     ======================================================================== */
  /* WHY THE TABLES ARE NOT AS LONG AS THEY COULD BE

     Nine units were cut so the catalogue lands on a round ten thousand:
     hogsheads, minims and drops from volume; bases 18, 24, 26 and 30; and the
     Marquesas and Chatham time zones.

     Every one of those was chosen for being the least likely thing anybody
     would convert, and cutting whole UNITS rather than individual pairs is
     what keeps the set coherent — trimming pairs would have left conversions
     that work in one direction and not the other, which is a far worse thing
     to ship than a missing hogshead.

     If the round number ever stops mattering, put them back. */

  var out = [];

  function fmt(n) {
    if (!isFinite(n)) return '—';
    var a = Math.abs(n);
    if (n === 0) return '0';
    if (a >= 1e15 || a < 1e-7) return n.toExponential(6);
    var r = a >= 1000 ? n.toFixed(4) : n.toPrecision(10);
    return String(parseFloat(r));
  }

  Object.keys(U).forEach(function (fam) {
    var F = U[fam];
    F.units.forEach(function (a) {
      F.units.forEach(function (b) {
        if (a[0] === b[0]) return;                 // metres to metres is not a tool
        out.push({
          id: 'conv-' + fam + '-' + a[0] + '-' + b[0],
          cat: 'converters',
          name: cap(a[2]) + ' to ' + b[2],
          desc: 'Convert ' + a[1] + ' (' + a[0] + ') to ' + b[1] + ' (' + b[0] + ').',
          gen: 'unit', fam: fam, from: a, to: b
        });
      });
    });
  });

  BASES.forEach(function (a) {
    BASES.forEach(function (b) {
      if (a[0] === b[0]) return;
      out.push({
        id: 'base-' + a[0] + '-' + b[0],
        cat: 'developer',
        name: cap(a[1]) + ' to ' + b[1],
        desc: 'Convert a base-' + a[0] + ' number to base-' + b[0] + '.',
        gen: 'base', from: a, to: b
      });
    });
  });

  ZONES.forEach(function (a) {
    ZONES.forEach(function (b) {
      if (a[0] === b[0]) return;
      out.push({
        id: 'tz-' + a[0] + '-' + b[0],
        cat: 'converters',
        name: a[1] + ' to ' + b[1] + ' time',
        desc: 'What a time in ' + a[1] + ' is in ' + b[1] + '. Standard time, no summer-time guessing.',
        gen: 'tz', from: a, to: b
      });
    });
  });

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ==========================================================================
     THE THREE GENERIC IMPLEMENTATIONS
     ==========================================================================
     One per family. Every generated tool in the catalogue is served by one of
     these, so there is no such thing as a card here that opens nothing.
     ======================================================================== */
  function convert(t, v) {
    if (t.gen === 'unit') {
      var F = U[t.fam];
      if (F.special === 'temp') return TEMP[t.to[0]].from(TEMP[t.from[0]].to(v));
      if (F.special === 'fuel') return FUEL[t.to[0]].from(FUEL[t.from[0]].to(v));
      return v * t.from[3] / t.to[3];
    }
    return v;
  }

  function implFor(t) {
    if (t.gen === 'unit') {
      return {
        html:
          "<div class='field'><label>" + cap(t.from[2]) + " (" + t.from[0] + ")</label>" +
          "<input id='v' type='number' step='any' value='1'></div>" +
          "<div class='out' id='o'></div>" +
          "<p class='note' id='wk'></p>",
        wire: function () {
          var v = document.getElementById('v'), o = document.getElementById('o'),
              wk = document.getElementById('wk');
          function go() {
            var n = parseFloat(v.value);
            if (!isFinite(n)) { o.textContent = '—'; wk.textContent = ''; return; }
            var r = convert(t, n);
            o.textContent = fmt(r) + ' ' + t.to[2];
            var F = U[t.fam];
            wk.textContent = F.special
              ? 'Converted through ' + F.base + '. This scale is not a simple ratio, so there is no single multiplier.'
              : '1 ' + t.from[1] + ' = ' + fmt(t.from[3] / t.to[3]) + ' ' + t.to[2] + '. ' +
                'Multiply by that, or divide to go back.';
          }
          v.oninput = go; go();
        }
      };
    }

    if (t.gen === 'base') {
      var fb = t.from[0], tb = t.to[0];
      return {
        html:
          "<div class='field'><label>Base-" + fb + " number</label>" +
          "<input id='v' value='" + (fb === 2 ? '1010' : fb === 16 ? 'ff' : '255') + "'></div>" +
          "<div class='out' id='o'></div><p class='note' id='wk'></p>",
        wire: function () {
          var v = document.getElementById('v'), o = document.getElementById('o'),
              wk = document.getElementById('wk');
          function go() {
            var raw = String(v.value).trim().toLowerCase().replace(/\s+/g, '');
            if (!raw) { o.textContent = '—'; wk.textContent = ''; return; }
            var neg = raw.charAt(0) === '-';
            if (neg) raw = raw.slice(1);
            /* Validate against the SOURCE base rather than letting parseInt
               quietly stop at the first bad digit — "129" in octal is not 10,
               it is a mistake, and saying so is more use than a wrong answer. */
            var digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fb);
            var ok = raw.length > 0;
            for (var i = 0; i < raw.length; i++) {
              if (digits.indexOf(raw.charAt(i)) < 0) { ok = false; break; }
            }
            if (!ok) {
              o.textContent = 'not a base-' + fb + ' number';
              wk.textContent = 'Base ' + fb + ' only uses the digits ' + digits + '.';
              return;
            }
            var n = parseInt(raw, fb);
            o.textContent = (neg ? '-' : '') + n.toString(tb);
            wk.textContent = 'That is ' + (neg ? '-' : '') + n + ' in decimal.';
          }
          v.oninput = go; go();
        }
      };
    }

    if (t.gen === 'tz') {
      var d = t.to[2] - t.from[2];
      return {
        html:
          "<div class='field'><label>Time in " + t.from[1] + "</label>" +
          "<input id='v' type='time' value='12:00'></div>" +
          "<div class='out' id='o'></div><p class='note' id='wk'></p>",
        wire: function () {
          var v = document.getElementById('v'), o = document.getElementById('o'),
              wk = document.getElementById('wk');
          function go() {
            var p = String(v.value || '').split(':');
            var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
            if (!isFinite(h) || !isFinite(m)) { o.textContent = '—'; return; }
            var mins = h * 60 + m + Math.round(d * 60);
            /* The day rolls. Saying "next day" matters more than the clock
               face when somebody is booking a call. */
            var day = Math.floor(mins / 1440);
            mins = ((mins % 1440) + 1440) % 1440;
            var hh = String(Math.floor(mins / 60)).padStart(2, '0');
            var mm = String(mins % 60).padStart(2, '0');
            o.textContent = hh + ':' + mm +
              (day > 0 ? ' (next day)' : day < 0 ? ' (previous day)' : '');
            wk.textContent = t.to[1] + ' is ' + (d === 0 ? 'the same as ' :
              (d > 0 ? '+' : '') + d + ' hours from ') + t.from[1] +
              '. Standard time only — this does not apply summer time.';
          }
          v.oninput = go; go();
        }
      };
    }
    return null;
  }

  window.NC_TOOLS = out;
  window.NC_TOOLS_IMPL = implFor;
  window.NC_TOOLS_STATS = {
    generated: out.length,
    families: Object.keys(U).length,
    zones: ZONES.length,
    bases: BASES.length
  };
})();
