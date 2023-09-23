# echo
A personal concert log

Features:

1. Enter a concert
   1. Multiple Artists
   2. Venue
   3. Date
   4. Comment
   5. Rating
   6. Favorite
   7. Pictures / Videos
2. Stats
3. Share (Looks like a ticket)
4. Calendar View?
5. Setlist?

Pages:

Home
    Stats
    Log of concerts
    Top artists and venues
Entry Modal
    Artist(s)
    Venue
    Date
Entry Page
    Artist(s)
    Venue
    Date
    Comment
    Upload pictures / videos
    Rate
    Favorite
    Share
Venue
    Times visited
    All the concerts at that venue
Artist
    Times seen
    All the times youve seen that artist

entry: {
    id str,
    artists [str],
    venue str,
    date date,
    comment str,
    media [str],
    rating int,
    favorite bool,
}

/artists
R
{
    artists [str]
}

/venues
R
{
    venues [str]
}

/artist/:artist
R
{
    entries {favorite, artists, venue, date, id},
    media [str]
}

/venue/:venue
R
{
    entries {favorite, artists, venue, date, id},
    media [str]
}

/stats
R - json of stats
{
    year: {num, pct},
    unique: {num, pct}
}

/top
R - json of top 5 artists and venues
in: {
    range str
}
out: {
    media str,
    times str,
    artist str,
} 

/entries
R - json of last 10 entries (paginated)
in: {
    page int
}
out: {
    favorite bool,
    artists str (comma seperated),
    venue str,
    date str (formatted as x y ago),
    id str,
}


/entry
C
{
    artists [str]
    venue str
    date date
}
R
{
    id str
}
{
    artists [str],
    venue str,
    date str,
    comment str,
    media [str],
    rating int,
    favorite bool,
}
U 
{
    artists [str],
    venue str,
    date str,
    comment str,
    media [str],
    rating int,
    favorite bool, 
}
D
{
    id str
}