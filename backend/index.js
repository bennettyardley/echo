const express = require('express')
const { Deta } = require('deta')

const app = express()
// eslint-disable-next-line no-undef
const port = process.env.PORT || 8080

const deta = Deta()
const db = deta.Base('echo')

function d2s(date) {
  const currentDate = new Date()
  const inputDateTime = date.getTime()
  const currentDateTime = currentDate.getTime()
  const timeDifference = currentDateTime - inputDateTime

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (timeDifference < week) {
    const daysAgo = Math.floor(timeDifference / day)
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`
  } else if (timeDifference < month) {
    const weeksAgo = Math.floor(timeDifference / week)
    return `${weeksAgo} week${weeksAgo !== 1 ? 's' : ''} ago`
  } else if (timeDifference < year) {
    const monthsAgo = Math.floor(timeDifference / month)
    return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`
  } else {
    const yearsAgo = Math.floor(timeDifference / year)
    return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`
  }
}

function yearStats(entries) {
  const currentYear = new Date().getFullYear()

  const currentYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear
  })

  const previousYearEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === currentYear - 1
  })

  const currentYearCount = currentYearEntries.length
  const previousYearCount = previousYearEntries.length

  const percentChange = previousYearCount !== 0 ? ((currentYearCount - previousYearCount) / previousYearCount) * 100 : 0

  const uniqueArtistsCurrentYear = new Set()
  currentYearEntries.forEach((entry) => {
    if (entry.artist) uniqueArtistsCurrentYear.add(entry.artist)
  })

  const uniqueArtistsPreviousYear = new Set()
  previousYearEntries.forEach((entry) => {
    if (entry.artist) uniqueArtistsPreviousYear.add(entry.artist)
  })

  const currentYearUniqueCount = uniqueArtistsCurrentYear.length
  const previousYearUniqueCount = uniqueArtistsPreviousYear.length

  const uniquePercentChange =
    previousYearUniqueCount !== 0 ? ((currentYearUniqueCount - previousYearUniqueCount) / previousYearUniqueCount) * 100 : 0

  return {
    currentYearCount,
    previousYearCount,
    percentChange,
    unique: uniqueArtistsCurrentYear.size,
    uniquePercent: uniquePercentChange,
  }
}

function calculateTopEntries(entries, artistName, dateRange) {
  // Get the current date
  const currentDate = new Date()

  // Define time intervals in milliseconds for last year and last decade
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const oneDecade = 10 * oneYear

  // Filter entries by artist name
  const filteredEntries = entries.filter((entry) => {
    return entry.artist === artistName
  })

  // Filter entries by date range
  const filteredEntriesByDate = filteredEntries.filter((entry) => {
    const entryDate = new Date(entry.date)

    switch (dateRange) {
      case 'allTime':
        return true // No date filter for all time
      case 'lastYear':
        return currentDate - entryDate <= oneYear
      case 'lastDecade':
        return currentDate - entryDate <= oneDecade
      default:
        return false
    }
  })

  // Sort entries by a relevant metric (e.g., by date or another field)
  // Replace 'date' with the actual field you want to sort by
  filteredEntriesByDate.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA // Sort in descending order by date
  })

  // Get the top 5 entries
  const topEntries = filteredEntriesByDate.slice(0, 5)

  return topEntries
}

app.get('/artists', async (req, res) => {
  const allEntries = await db.fetch()
  let artists = []
  for (let entry in allEntries.items) {
    artists.concat(entry.artists)
  }
  res.json(artists)
})

app.get('/venues', async (req, res) => {
  const allEntries = await db.fetch()
  let venues = []
  for (let entry in allEntries.items) {
    venues.push(entry.venue)
  }
  res.json(venues)
})

app.get('/artist/:artist', async (req, res) => {
  const entries = await db.fetch({ 'artists?contains': req.params.artist })
  let formattedEntries = []
  let media = []
  for (let entry in entries.items) {
    formattedEntries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }
  res.json({ entries: formattedEntries, media })
})

app.get('/venue/:venue', async (req, res) => {
  const entries = await db.fetch({ venue: req.params.venue })
  let formattedEntries = []
  let media = []
  for (let entry in entries.items) {
    formattedEntries.push({
      favorite: entry.favorite,
      artists: entry.artists.join(', '),
      venue: entry.venue,
      date: d2s(entry.date),
      id: entry.key,
    })
  }
  res.json({ entries: formattedEntries, media })
})

app.get('/stats', async (req, res) => {
  const allEntries = await db.fetch()
  const stats = yearStats(allEntries)

  res.json({
    year: {
      num: `${stats.currentYearCount}`,
      pct: `${stats.percentChange.toFixed(2)}%`,
    },
    unique: {
      num: `${stats.unique}`,
      pct: `${stats.uniquePercent.toFixed(2)}%`,
    },
  })
})

app.get('/top', async (req, res) => {
  const allEntries = await db.fetch()
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
