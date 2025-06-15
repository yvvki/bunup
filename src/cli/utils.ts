import pc from 'picocolors'
import { logger } from '../logger'

export function displayBunupGradientArt(): void {
	const art = `
██████╗ ██╗   ██╗███╗   ██╗██╗   ██╗██████╗ 
██╔══██╗██║   ██║████╗  ██║██║   ██║██╔══██╗
██████╔╝██║   ██║██╔██╗ ██║██║   ██║██████╔╝
██╔══██╗██║   ██║██║╚██╗██║██║   ██║██╔═══╝ 
██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝██║     
╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     
	`.trim()

	const lines = art.split('\n')

	logger.space()
	for (const line of lines) {
		console.log(pc.cyan(line))
	}
	logger.space()
}
